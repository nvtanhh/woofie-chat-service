const Joi = require('joi');
const MESSAGE_TYPES = require('../utils/constants');
const { objectId } = require('./custom.validation');

const getMessageByRoomId = {
  params: Joi.object().keys({
    roomId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(0),
  }),
};

const createNewMessage = {
  params: Joi.object().keys({
    roomId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
    type: Joi.string().valid(MESSAGE_TYPES).default('text'),
  }),
};

module.exports = { getMessageByRoomId, createNewMessage };
