const express = require('express');
const router = express.Router();
const { createShare, getShares, accessSharedDocument, revokeShare } = require('../controllers/shareController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/access/:token', optionalAuth, accessSharedDocument);
router.use(protect);
router.post('/', createShare);
router.get('/document/:documentId', getShares);
router.delete('/:shareId', revokeShare);

module.exports = router;
