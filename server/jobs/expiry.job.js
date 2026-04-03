const FoodListing = require('../models/FoodListing');
const logger = require('../utils/logger');

/**
 * Check for expired listings and update their status
 * Runs periodically via setInterval
 */
const checkExpiredListings = async (io) => {
  try {
    const now = new Date();

    const expiredListings = await FoodListing.updateMany(
      {
        status: 'available',
        expiryAt: { $lte: now },
      },
      {
        status: 'expired',
      }
    );

    if (expiredListings.modifiedCount > 0) {
      logger.info(`Expired ${expiredListings.modifiedCount} listings`);

      // Notify all connected clients
      if (io) {
        io.to('role_ngo').emit('listings:expired', {
          count: expiredListings.modifiedCount,
        });
      }
    }
  } catch (error) {
    logger.error('Expiry job error:', error.message);
  }
};

/**
 * Start the expiry check interval
 */
const startExpiryJob = (io, intervalMs = 60000) => {
  logger.info(`Starting expiry job (interval: ${intervalMs / 1000}s)`);

  // Run immediately once
  checkExpiredListings(io);

  // Then run on interval
  const intervalId = setInterval(() => checkExpiredListings(io), intervalMs);

  return intervalId;
};

module.exports = { checkExpiredListings, startExpiryJob };
