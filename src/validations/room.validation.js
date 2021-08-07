const Joi = require('joi');

const getRecentChatRooms = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    skip: Joi.number().integer().default(0),
    acceptEmptyChatRoom: Joi.boolean().default(true),
  }),
};

const initiate = {
  body: Joi.object().keys({
    members: Joi.array()
      .items(Joi.string())
      .unique((a, b) => a === b)
      .required(),
    isGroup: Joi.bool().default(false),
  }),
};

module.exports = {
  getRecentChatRooms,
  initiate,
};
