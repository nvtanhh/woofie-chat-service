const RoomModel = require('../models/room.model');

/**
 * @param {String} userId - id of user
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of all chatroom that the user belongs to
 */
const getRecentChatRoomsByUserId = async (userId, options) => {
  return RoomModel.find({ members: { $all: [userId] } })
    .sort('-updatedAt')
    .skip(options.skip)
    .limit(options.limit);
};

/**
 * @param {Array} members - array of strings of members
 * @param {String} creatorId - user's ID who initiated the chat
 * @param {bool} isGroup - is group chat or private chat default is false
 * @return {Object} available or new Chat room
 */
const initiateChatRoom = async function (members, creatorId, isGroup = false) {
  const availableRoom = await RoomModel.findOne({
    members: {
      $size: members.length,
      $all: [...members],
    },
    isGroup,
  });

  if (availableRoom) {
    return availableRoom.toJSON();
  }
  // is private chat
  if (!isGroup && members.length === 2) {
    const newRoom = await RoomModel.create({ name: `${creatorId}_${members[0]}`, members, isGroup, creator: creatorId });
    return newRoom.toJSON();
  }
};

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
const getChatRoomByRoomId = async (roomId) => {
  return RoomModel.findById(roomId);
};

module.exports = { getRecentChatRoomsByUserId, initiateChatRoom, getChatRoomByRoomId };
