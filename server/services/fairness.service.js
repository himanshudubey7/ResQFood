const Claim = require('../models/Claim');
const Organization = require('../models/Organization');
const User = require('../models/User');

/**
 * Calculate fairness score for an NGO claiming a listing
 * Score = (needLevel * 0.4) + (proximityScore * 0.3) + (inverseAllocationScore * 0.3)
 */
const calculateFairnessScore = async (ngoId, listing) => {
  try {
    const ngoUser = await User.findById(ngoId).populate('organizationId');
    
    // Need level (1-10, normalized to 0-1)
    const needLevel = ngoUser?.organizationId?.needLevel || 5;
    const needScore = needLevel / 10;

    // Proximity score (based on distance, closer = higher)
    let proximityScore = 0.5; // default
    if (ngoUser?.location?.coordinates && listing?.geo?.coordinates) {
      const distance = haversineDistance(
        ngoUser.location.coordinates[1],
        ngoUser.location.coordinates[0],
        listing.geo.coordinates[1],
        listing.geo.coordinates[0]
      );
      // Score: 1.0 for <1km, decreasing to 0 for >50km
      proximityScore = Math.max(0, 1 - distance / 50);
    }

    // Inverse allocation score (fewer past allocations = higher score)
    const pastClaimCount = await Claim.countDocuments({
      ngoId,
      status: 'approved',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
    });
    const inverseAllocationScore = Math.max(0, 1 - pastClaimCount / 50);

    const totalScore =
      needScore * 0.4 + proximityScore * 0.3 + inverseAllocationScore * 0.3;

    return Math.round(totalScore * 100) / 100;
  } catch (error) {
    console.error('Fairness score calculation error:', error.message);
    return 0.5;
  }
};

/**
 * Get ranked NGOs for auto-assignment suggestions
 */
const getRankedNGOs = async (listing) => {
  try {
    const ngos = await User.find({ role: 'ngo' }).populate('organizationId');
    
    const scored = await Promise.all(
      ngos.map(async (ngo) => {
        const score = await calculateFairnessScore(ngo._id, listing);
        return { ngo, score };
      })
    );

    return scored.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Ranked NGOs error:', error.message);
    return [];
  }
};

// Haversine distance calculation (returns km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = { calculateFairnessScore, getRankedNGOs, haversineDistance };
