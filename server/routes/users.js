const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getStorageInfo } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/password', changePassword);
router.get('/storage', getStorageInfo);

module.exports = router;
