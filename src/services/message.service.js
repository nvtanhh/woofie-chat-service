const Message = require('../models/message.model');

/**
 * @param {String} chatRoomId - chat room id
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of message of the roomId
 */
const getMessagesByRoomId = async (chatRoomId, options) => {
  return Message.find({ chatRoomId }).sort('-createdAt').skip(options.skip).limit(options.limit);
};

/**
 * This method will create a new message
 *
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} senderId - user's ID who is posting the message
 * @returns {Object} new message
 */
const createNewMessage = async (chatRoomId, message, senderId) => {
  return Message.create({
    chatRoomId,
    content: message.content,
    type: message.type,
    sender: senderId,
    description: message.description,
    createdAt: message.createdAt,
  });
};

// /**
//  * @param {String} chatRoomId - chat room id
//  * @param {String} currentUserOnlineId - user id
//  */
// const markMessageRead = async function (chatRoomId, currentUserOnlineId) {
//   return this.updateMany(
//     {
//       chatRoomId,
//       'readByRecipients.reader': { $ne: currentUserOnlineId },
//     },
//     {
//       $addToSet: {
//         readByRecipients: { reader: currentUserOnlineId },
//       },
//     },
//     {
//       multi: true,
//     }
//   );
// };

module.exports = { getMessagesByRoomId, createNewMessage };
