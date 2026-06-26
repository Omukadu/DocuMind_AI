const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const WorkspaceMember = require('../models/WorkspaceMember');

// @desc  Get all users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc  Update user status/role
const updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { isActive, role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc  Get all workspaces
const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, workspaces });
  } catch (err) { next(err); }
};

// @desc  Get platform analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [userCount, workspaceCount, docCount, activeUsers] = await Promise.all([
      User.countDocuments(),
      Workspace.countDocuments({ isActive: true }),
      Document.countDocuments({ isDeleted: false }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    const newUsersLast7 = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const newDocsLast7 = await Document.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }, { $limit: 30 },
    ]);

    res.json({
      success: true,
      analytics: { totalUsers: userCount, totalWorkspaces: workspaceCount, totalDocuments: docCount, activeUsers, newUsersLast7, newDocsLast7, userGrowth },
    });
  } catch (err) { next(err); }
};

// @desc  Get audit logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const query = {};
    if (action) query.action = new RegExp(action, 'i');
    if (userId) query.user = userId;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email').populate('workspace', 'name'),
      AuditLog.countDocuments(query),
    ]);
    res.json({ success: true, logs, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

module.exports = { getUsers, updateUser, getWorkspaces, getAnalytics, getAuditLogs };
