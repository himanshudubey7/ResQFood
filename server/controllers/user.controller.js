const User = require('../models/User');
const Organization = require('../models/Organization');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all users (admin)
// @route   GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('organizationId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user (admin)
// @route   PATCH /api/users/:id/verify
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).populate('organizationId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also verify their organization
    if (user.organizationId) {
      await Organization.findByIdAndUpdate(user.organizationId._id || user.organizationId, {
        verifiedStatus: 'verified',
      });
    }

    // Emit notification via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('notification:new', {
        type: 'user_verified',
        title: 'Account Verified',
        message: 'Your account has been verified by an admin.',
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      location,
      orgName,
      orgType,
      orgAddress,
      orgDescription,
      orgContactPhone,
      orgContactEmail,
      orgCapacity,
      orgNeedLevel,
    } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    if (req.file?.buffer) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'resqfood/avatars');
      updates.avatar = uploaded.secure_url;
    }

    if (location) {
      let parsedLocation = location;
      if (typeof location === 'string') {
        try {
          parsedLocation = JSON.parse(location);
        } catch {
          parsedLocation = { address: location };
        }
      }

      updates.location = {
        type: 'Point',
        coordinates: [Number(parsedLocation?.lng) || 0, Number(parsedLocation?.lat) || 0],
        address: parsedLocation?.address || '',
      };
    }

    let user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('organizationId');

    if (user?.organizationId && (user.role === 'donor' || user.role === 'ngo')) {
      const orgUpdates = {};

      if (orgName) orgUpdates.name = orgName;
      if (orgType) orgUpdates.type = orgType;
      if (orgAddress) orgUpdates.address = orgAddress;
      if (orgDescription !== undefined) orgUpdates.description = orgDescription;
      if (orgContactPhone) orgUpdates.contactPhone = orgContactPhone;
      if (orgContactEmail) orgUpdates.contactEmail = orgContactEmail;
      if (orgCapacity !== undefined && orgCapacity !== '') orgUpdates.capacity = Number(orgCapacity);
      if (orgNeedLevel !== undefined && orgNeedLevel !== '') orgUpdates.needLevel = Number(orgNeedLevel);

      if (Object.keys(orgUpdates).length > 0) {
        await Organization.findByIdAndUpdate(user.organizationId._id || user.organizationId, orgUpdates, {
          new: true,
          runValidators: true,
        });
      }

      user = await User.findById(req.user._id).populate('organizationId');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] },
          },
        },
      },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, verifyUser, updateProfile, getUserStats };
