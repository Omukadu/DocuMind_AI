const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.post('/mark-all-read', markAllAsRead);
router.route('/:id').patch(markAsRead).delete(deleteNotification);

module.exports = router;
