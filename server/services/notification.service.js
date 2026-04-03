const Notification = require('../models/Notification');

/**
 * Create a notification and emit via Socket.IO
 */
const sendNotification = async (io, userId, { type, title, message, data = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
    });

    if (io) {
      io.to(`user_${userId}`).emit('notification:new', {
        _id: notification._id,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
    return null;
  }
};

/**
 * Send notification to all users with a specific role
 */
const sendRoleNotification = async (io, role, { type, title, message, data = {} }) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ role }).select('_id');

    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          userId: user._id,
          type,
          title,
          message,
          data,
        })
      )
    );

    if (io) {
      io.to(`role_${role}`).emit('notification:new', {
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date(),
      });
    }

    return notifications;
  } catch (error) {
    console.error('Role notification error:', error.message);
    return [];
  }
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const query = { userId };
  if (unreadOnly) query.read = false;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return { notifications, total, unreadCount };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  return Notification.updateMany({ userId, read: false }, { read: true });
};

module.exports = {
  sendNotification,
  sendRoleNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
