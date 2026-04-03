/**
 * Haversine distance between two lat/lng points (returns km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Build GeoJSON Point from lat/lng
 */
const buildGeoPoint = (lat, lng) => ({
  type: 'Point',
  coordinates: [Number(lng), Number(lat)],
});

/**
 * Build MongoDB $near query
 */
const nearQuery = (lat, lng, maxDistanceKm = 50) => ({
  $near: {
    $geometry: buildGeoPoint(lat, lng),
    $maxDistance: maxDistanceKm * 1000,
  },
});

module.exports = { haversineDistance, buildGeoPoint, nearQuery };
