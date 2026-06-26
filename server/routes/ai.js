const express = require('express');
const router = express.Router();
const { generateSummary, getSummary, createChat, getChats, getChat, sendMessage, deleteChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.post('/summary/:documentId', aiLimiter, generateSummary);
router.get('/summary/:documentId', getSummary);
router.route('/chats').get(getChats).post(createChat);
router.route('/chats/:chatId').get(getChat).delete(deleteChat);
router.post('/chats/:chatId/messages', aiLimiter, sendMessage);

module.exports = router;
