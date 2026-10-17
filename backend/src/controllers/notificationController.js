const Notification = require('../models/Notification');

// Helper function to create notification
const createNotificationHelper = async (userId, title, message) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
    });
  } catch (error) {
    console.error('Error creating notification log:', error);
  }
};

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      status: 'success',
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update notification status' });
  }
};

module.exports = {
  createNotificationHelper,
  getNotifications,
  markAsRead,
};
