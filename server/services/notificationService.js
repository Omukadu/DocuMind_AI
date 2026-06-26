const Notification = require('../models/Notification');

const createNotification = async ({ user, workspace, type, category, title, message, link, actor, targetDocument }) => {
  try {
    return await Notification.create({ user, workspace, type, category, title, message, link, actor, targetDocument });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

const notifyWorkspaceMembers = async (members, notifData) => {
  const notifications = members.map((userId) => ({ ...notifData, user: userId }));
  try {
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

module.exports = { createNotification, notifyWorkspaceMembers };
