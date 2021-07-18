/* eslint-disable no-console */
/* eslint-disable no-useless-catch */
import { bool } from 'joi';
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: String,
    members: [
      {
        type: String,
      },
    ],
    isGroup: { type: bool, default: false },
    creator: String,
  },
  {
    timestamps: true,
  }
);

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
roomSchema.statics.getChatRoomsByUserId = async function (userId) {
  try {
    const rooms = await this.find({ members: { $all: [userId] } });
    return rooms;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
roomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId });
    return room;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Array} members - array of strings of members
 * @param {String} creator - user who initiated the chat
 * @param {bool} isGroup - is group chat or private chat default is false
 */
roomSchema.statics.initiateChat = async function (members, creator, isGroup = false) {
  try {
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
        chatRoomId: availableRoom._doc._id,
        type: availableRoom._doc.type,
      };
    }

    const newRoom = await this.create({ members, type: isGroup, creator });
    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._doc._id,
      type: newRoom._doc.type,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
};

export default mongoose.model('ChatRoom', roomSchema);
