/* eslint-disable no-console */
const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    name: String,
    members: [
      {
        type: String,
      },
    ],
    isGroup: { type: Boolean, default: false },
    creator: String,
  },
  {
    timestamps: true,
  }
);

/**
 * @param {String} userId - id of user
 * @param {{ page, limit }} options - pagination options
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId, options) {
  const rooms = await this.find({ members: { $all: [userId] } })
    .skip(options.page * options.limit)
    .limit(options.limit);
  return rooms;
};

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  const room = await this.findOne({ _id: roomId });
  return room;
};

/**
 * @param {Array} members - array of strings of members
 * @param {String} creator - user who initiated the chat
 * @param {bool} isGroup - is group chat or private chat default is false
 */
chatRoomSchema.statics.initiateChat = async function (members, creator, isGroup = false) {
  const availableRoom = await this.findOne({
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
    const newRoom = await this.create({ name: `${creator}_${members.first}`, members, isGroup, creator });
    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._id,
      isGroup: newRoom.isGroup,
    };
  }
};

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
