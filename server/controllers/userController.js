const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc  Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    if (req.file) {
      if (req.user.avatar) {
        const oldPath = path.join(__dirname, '..', req.user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.avatar = `/uploads/${req.user._id}/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc  Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) { next(err); }
};

// @desc  Get user storage info
const getStorageInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, storage: user.storage });
  } catch (err) { next(err); }
};

module.exports = { updateProfile, changePassword, getStorageInfo };
