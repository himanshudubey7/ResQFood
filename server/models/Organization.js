const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['ngo', 'restaurant', 'farm', 'grocery', 'other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    needLevel: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    verifiedStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Organization', organizationSchema);
