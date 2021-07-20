const express = require('express');
const roomController = require('../controllers/room.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const roomValidation = require('../validations/room.validation');

const router = express.Router();

router
  .route('/')
  .use(auth())
  .get(validate(roomValidation.getRecentChatRooms), roomController.getRecentChatRooms)
  .post(validate(roomValidation.initiate), roomController.initiate);

module.exports = router;
