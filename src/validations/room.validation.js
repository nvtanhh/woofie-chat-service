const Joi = require('joi');

const getRecentChatRooms = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(0),
  }),
};
const initiate = {
  body: Joi.object().keys({
    members: Joi.array()
      .items(Joi.string())
      .unique((a, b) => a === b)
      .default([]),
    isGroup: Joi.bool().default(false),
  }),
};

module.exports = {
  getRecentChatRooms,
  initiate,
};
