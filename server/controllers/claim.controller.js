const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const { calculateFairnessScore } = require('../services/fairness.service');

// @desc    Claim a listing (atomic - first valid claim wins)
// @route   POST /api/listings/:id/claim
const claimListing = async (req, res, next) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can claim listings',
      });
    }

    const listingId = req.params.id;
    const ngoId = req.user._id;

    // Atomic update - only claim if status is still 'available'
    const listing = await FoodListing.findOneAndUpdate(
      {
        _id: listingId,
        status: 'available',
      },
      {
        status: 'claimed',
        claimedBy: ngoId,
        claimedAt: new Date(),
      },
      {
        new: true,
      }
    ).populate('donorId', 'name email');

    if (!listing) {
      return res.status(409).json({
        success: false,
        message: 'Listing is no longer available or does not exist',
      });
    }

    // Calculate fairness score
    const priorityScore = await calculateFairnessScore(ngoId, listing);

    // Create claim record
    const claim = await Claim.create({
      listingId: listing._id,
      ngoId,
      status: 'approved',
      priorityScore,
      notes: req.body.notes || '',
    });

    // Create notification for donor
    await Notification.create({
      userId: listing.donorId._id,
      type: 'listing_claimed',
      title: 'Listing Claimed',
      message: `Your listing "${listing.title}" has been claimed by ${req.user.name}`,
      data: { listingId: listing._id, claimId: claim._id },
    });

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      // Notify donor
      io.to(`user_${listing.donorId._id}`).emit('listing:claimed', {
        listing,
        claimedBy: { name: req.user.name, email: req.user.email },
      });

      // Notify all NGOs that listing is no longer available
      io.to('role_ngo').emit('listing:updated', listing);

      // Send notification
      io.to(`user_${listing.donorId._id}`).emit('notification:new', {
        type: 'listing_claimed',
        title: 'Listing Claimed',
        message: `Your listing "${listing.title}" has been claimed`,
      });
    }

    res.json({
      success: true,
      data: { listing, claim },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims by NGO
// @route   GET /api/claims
const getMyClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { ngoId: req.user._id };
    if (status) query.status = status;

    const total = await Claim.countDocuments(query);
    const claims = await Claim.find(query)
      .populate({
        path: 'listingId',
        populate: [
          { path: 'donorId', select: 'name email avatar' },
          { path: 'assignedVolunteer', select: 'name email phone' },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: claims,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims (admin)
// @route   GET /api/claims/all
const getAllClaims = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Claim.countDocuments();
    const claims = await Claim.find()
      .populate('listingId')
      .populate('ngoId', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: claims,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { claimListing, getMyClaims, getAllClaims };
