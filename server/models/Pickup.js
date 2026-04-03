const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'assigned',
        'en_route_to_donor',
        'picked_up',
        'en_route_to_ngo',
        'delivered',
        'cancelled',
      ],
      default: 'assigned',
    },
    route: {
      encodedPolyline: String,
      distance: String,
      duration: String,
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
    proofPhotos: [
      {
        url: String,
        publicId: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

pickupSchema.index({ volunteerId: 1, status: 1 });
pickupSchema.index({ listingId: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);
