const MessageModel = require('../models/message.model');

/**
 * @param {String} chatRoomId - chat room id
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of message of the roomId
 */
const getMessagesByRoomId = async (roomId, options) => {
  return MessageModel.find({ roomId })
    .sort('-createdAt', -1)
    .skip(options.page * options.limit)
    .limit(options.limit);
};

module.exports = { getMessagesByRoomId };
