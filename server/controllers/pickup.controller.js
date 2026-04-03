const FoodListing = require('../models/FoodListing');
const Pickup = require('../models/Pickup');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Assign volunteer to pickup
// @route   POST /api/pickups/assign
const assignVolunteer = async (req, res, next) => {
  try {
    const { listingId, volunteerId } = req.body;

    const listing = await FoodListing.findById(listingId)
      .populate('donorId', 'name email')
      .populate('claimedBy', 'name email');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status !== 'claimed') {
      return res.status(400).json({
        success: false,
        message: 'Listing must be claimed before assigning a volunteer',
      });
    }

    // Update listing with assigned volunteer
    listing.assignedVolunteer = volunteerId;
    await listing.save();

    // Create pickup record
    const pickup = await Pickup.create({
      listingId: listing._id,
      volunteerId,
      ngoId: listing.claimedBy._id || listing.claimedBy,
      donorId: listing.donorId._id || listing.donorId,
      status: 'assigned',
    });

    // Notify volunteer
    await Notification.create({
      userId: volunteerId,
      type: 'pickup_assigned',
      title: 'New Pickup Assigned',
      message: `You have been assigned to pick up "${listing.title}"`,
      data: { listingId: listing._id, pickupId: pickup._id },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${volunteerId}`).emit('pickup:assigned', {
        pickup,
        listing,
      });
      io.to(`user_${volunteerId}`).emit('notification:new', {
        type: 'pickup_assigned',
        title: 'New Pickup Assigned',
        message: `Pick up "${listing.title}"`,
      });
    }

    res.status(201).json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pickup status
// @route   PATCH /api/pickups/:id/status
const updatePickupStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['en_route_to_donor', 'picked_up', 'en_route_to_ngo', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    pickup.status = status;
    if (status === 'delivered') {
      pickup.completedAt = new Date();
      // Update listing status
      await FoodListing.findByIdAndUpdate(pickup.listingId, {
        status: 'delivered',
        deliveredAt: new Date(),
      });
    }
    if (status === 'picked_up') {
      await FoodListing.findByIdAndUpdate(pickup.listingId, {
        status: 'picked_up',
        pickedUpAt: new Date(),
      });
    }

    await pickup.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${pickup.donorId}`).emit('pickup:statusChanged', { pickup, status });
      io.to(`user_${pickup.ngoId}`).emit('pickup:statusChanged', { pickup, status });
    }

    res.json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload proof photos
// @route   POST /api/pickups/:id/proof
const uploadProof = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    let proofPhotos = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'resqfood/proofs')
        );
        const results = await Promise.all(uploadPromises);
        proofPhotos = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
      } catch (uploadErr) {
        console.error('Proof upload failed:', uploadErr.message);
      }
    }

    pickup.proofPhotos.push(...proofPhotos);
    await pickup.save();

    res.json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my pickups (volunteer)
// @route   GET /api/pickups/my
const getMyPickups = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { volunteerId: req.user._id };
    if (status) query.status = status;

    const total = await Pickup.countDocuments(query);
    const pickups = await Pickup.find(query)
      .populate({
        path: 'listingId',
        populate: { path: 'donorId', select: 'name email avatar phone location' },
      })
      .populate('ngoId', 'name email phone location')
      .populate('donorId', 'name email phone location')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: pickups,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pickups (admin)
// @route   GET /api/pickups
const getAllPickups = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Pickup.countDocuments(query);
    const pickups = await Pickup.find(query)
      .populate('listingId')
      .populate('volunteerId', 'name email')
      .populate('ngoId', 'name email')
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: pickups,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { assignVolunteer, updatePickupStatus, uploadProof, getMyPickups, getAllPickups };
