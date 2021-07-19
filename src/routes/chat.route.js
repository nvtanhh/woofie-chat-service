const express = require('express');
const chatController = require('../controllers/chat.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router
  .get('/', auth(), chatController.getRecentConversation)
  .post('/initiate', auth(), chatController.initiate)
  .get('/:roomId', auth(), chatController.getConversationByRoomId)
  .post('/:roomId/message', auth(), chatController.sendMessage)
  .put('/:roomId/mark-read', auth(), chatController.markConversationReadByRoomId)
  .delete('/room/:roomId', auth(), chatController.deleteRoomById)
  .delete('/message/:messageId', auth(), chatController.deleteMessageById);

module.exports = router;
