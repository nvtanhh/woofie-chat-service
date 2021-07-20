const express = require('express');
const messageController = require('../controllers/message.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const messageValidation = require('../validations/message.validation');

const router = express.Router();

router
  .route('/:roomId')
  .get(auth, validate(messageValidation.getMessageByRoomId), messageController.getConversationByRoomId)
  .post(auth, validate(messageValidation.createNewMessage), messageController.createNewMessage);

module.exports = router;
