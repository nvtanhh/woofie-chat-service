const Joi = require('joi');
const { objectId, isMessageType } = require('./custom.validation');

const getMessageByRoomId = {
  params: Joi.object().keys({
    roomId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    skip: Joi.number().integer().default(0),
  }),
};

const createNewMessage = {
  params: Joi.object().keys({
    roomId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
    type: Joi.string().default('T').custom(isMessageType),
    description: Joi.string(),
    createdAt: Joi.string(),
  }),
};

module.exports = { getMessageByRoomId, createNewMessage };
