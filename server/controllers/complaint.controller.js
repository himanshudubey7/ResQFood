const Complaint = require('../models/Complaint');
const Claim = require('../models/Claim');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

const ALLOWED_TYPES = ['spoiled_food', 'fake_ngo', 'no_show', 'inappropriate_behavior', 'other'];

const createComplaint = async (req, res, next) => {
  try {
    const { reportedUser, listingId, type, description } = req.body;

    if (!reportedUser || !listingId || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'reportedUser, listingId, type and description are required',
      });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint type',
      });
    }

    if (String(reportedUser) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    const targetUser = await User.findById(reportedUser).select('name role');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Reported user not found' });
    }

    const listing = await FoodListing.findById(listingId).select('donorId');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (req.user.role === 'donor') {
      if (String(listing.donorId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You can only report for your own listings' });
      }

      const hasClaim = await Claim.exists({ listingId, ngoId: reportedUser });
      if (!hasClaim) {
        return res.status(400).json({ success: false, message: 'No matching claim found for this NGO and listing' });
      }
    }

    if (req.user.role === 'ngo') {
      const myClaim = await Claim.findOne({ listingId, ngoId: req.user._id }).populate('listingId', 'donorId');

      if (!myClaim || !myClaim.listingId) {
        return res.status(400).json({ success: false, message: 'No matching claim found for this listing' });
      }

      if (String(myClaim.listingId.donorId) !== String(reportedUser)) {
        return res.status(400).json({ success: false, message: 'Selected donor does not match listing owner' });
      }
    }

    const complaint = await Complaint.create({
      reportedBy: req.user._id,
      reportedUser,
      listingId,
      type,
      description: String(description).trim(),
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('reportedBy', 'name email role')
      .populate('reportedUser', 'name email role')
      .populate('listingId', 'title address');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint: populatedComplaint },
    });
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const [submitted, againstMe] = await Promise.all([
      Complaint.find({ reportedBy: req.user._id })
        .populate('reportedUser', 'name email role')
        .populate('listingId', 'title address')
        .sort({ createdAt: -1 }),
      Complaint.find({ reportedUser: req.user._id })
        .populate('reportedBy', 'name email role')
        .populate('listingId', 'title address')
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        submitted,
        againstMe,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
};
