const RoomModel = require('../models/room.model');

/**
 * @param {String} userId - id of user
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of all chatroom that the user belongs to
 */
const getRecentChatRoomsByUserId = async (userId, options) => {
  return RoomModel.find({ members: { $all: [userId] } })
    .skip(options.page * options.limit)
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
    return {
      isNew: false,
      message: 'retrieving an old chat room',
      chatRoomId: availableRoom._id,
      isGroup: availableRoom.isGroup,
    };
  }

  if (!isGroup && members.length === 1) {
    const newRoom = await RoomModel.create({ name: `${creatorId}_${members.first}`, members, isGroup, creator: creatorId });
    return {
      isNew: true,
      message: 'create a new chatroom',
      chatRoomId: newRoom._id,
      isGroup: newRoom.isGroup,
    };
  }
};

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
const getChatRoomByRoomId = async function (roomId) {
  const room = await RoomModel.findOne({ _id: roomId });
  return room;
};

module.exports = { getRecentChatRoomsByUserId, initiateChatRoom, getChatRoomByRoomId };
