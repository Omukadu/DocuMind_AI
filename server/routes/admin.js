const express = require('express');
const router = express.Router();
const { getUsers, updateUser, getWorkspaces, getAnalytics, getAuditLogs } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('admin', 'superadmin'));
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);
router.get('/workspaces', getWorkspaces);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
