const express = require('express');
const roomController = require('../controllers/room.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const roomValidation = require('../validations/room.validation');

const router = express.Router();

router
  .route('/')
  .get(auth, validate(roomValidation.getRecentChatRooms), roomController.getRecentChatRooms)
  .post(auth, validate(roomValidation.initiate), roomController.initiateChatRoom);

module.exports = router;
