const Message = require('../models/message.model');

/**
 * @param {String} chatRoomId - chat room id
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of message of the roomId
 */
const getMessagesByRoomId = async (roomId, options) => {
  return Message.find({ roomId })
    .sort('-createdAt', -1)
    .skip(options.page * options.limit)
    .limit(options.limit);
};

/**
 * This method will create a new message
 *
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} senderId - user's ID who is posting the message
 * @returns {Object} new message
 */
const createNewMessage = async function (chatRoomId, message, senderId) {
  return Message.create({
    chatRoomId,
    message: message.content,
    type: message.type,
    sender: senderId,
    readByRecipients: { reader: senderId },
  });
};

module.exports = { getMessagesByRoomId, createNewMessage };
