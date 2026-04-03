const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notification.service');

const initializeSocket = (io) => {
  // JWT authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.role})`);

    // Join personal room
    socket.join(`user_${user._id}`);

    // Join role-based room
    socket.join(`role_${user.role}`);

    // Handle notification requests
    socket.on('notifications:get', async (data, callback) => {
      try {
        const result = await getUserNotifications(user._id, data || {});
        if (callback) callback({ success: true, data: result });
      } catch (error) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('notifications:markRead', async (data, callback) => {
      try {
        if (data.notificationId) {
          await markAsRead(data.notificationId, user._id);
        } else {
          await markAllAsRead(user._id);
        }
        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle listing events
    socket.on('listing:subscribe', (listingId) => {
      socket.join(`listing_${listingId}`);
    });

    socket.on('listing:unsubscribe', (listingId) => {
      socket.leave(`listing_${listingId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.name}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
