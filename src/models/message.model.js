/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import mongoose from 'mongoose';

const readByRecipientSchema = new mongoose.Schema(
  {
    reader: String,
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    message: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',
    },
    sender: String,
    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * This method will create a post in chat
 *
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} sender - user who is posting the message
 */
messageSchema.statics.createPostInChatRoom = async function (chatRoomId, message, sender) {
  try {
    const post = await this.create({
      chatRoomId,
      message,
      sender,
      readByRecipients: { reader: sender },
    });
    const aggregate = await this.aggregate([
      // get post where _id = post._id
      { $match: { _id: post._id } },
      // do a join on another table called users, and
      // get me a user whose _id = sender
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      // do a join on another table called chatrooms, and
      // get me a chatroom whose _id = chatRoomId
      {
        $lookup: {
          from: 'chatrooms',
          localField: 'chatRoomId',
          foreignField: '_id',
          as: 'chatRoomInfo',
        },
      },
      { $unwind: '$chatRoomInfo' },
      { $unwind: '$chatRoomInfo.userIds' },
      // do a join on another table called users, and
      // get me a user whose _id = userIds
      {
        $lookup: {
          from: 'users',
          localField: 'chatRoomInfo.userIds',
          foreignField: '_id',
          as: 'chatRoomInfo.userProfile',
        },
      },
      { $unwind: '$chatRoomInfo.userProfile' },
      // group data
      {
        $group: {
          _id: '$chatRoomInfo._id',
          postId: { $last: '$_id' },
          chatRoomId: { $last: '$chatRoomInfo._id' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          sender: { $last: '$sender' },
          readByRecipients: { $last: '$readByRecipients' },
          chatRoomInfo: { $addToSet: '$chatRoomInfo.userProfile' },
          createdAt: { $last: '$createdAt' },
          updatedAt: { $last: '$updatedAt' },
        },
      },
    ]);
    return aggregate[0];
  } catch (error) {
    throw error;
  }
};

/**
 * @param {String} chatRoomId - chat room id
 */
messageSchema.statics.getConversationByRoomId = async function (chatRoomId, options = {}) {
  try {
    return this.aggregate([
      { $match: { chatRoomId } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and
      // get me a user whose _id = sender
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
    ]);
  } catch (error) {
    throw error;
  }
};

/**
 * @param {String} chatRoomId - chat room id
 * @param {String} currentUserOnlineId - user id
 */
messageSchema.statics.markMessageRead = async function (chatRoomId, currentUserOnlineId) {
  try {
    return this.updateMany(
      {
        chatRoomId,
        'readByRecipients.reader': { $ne: currentUserOnlineId },
      },
      {
        $addToSet: {
          readByRecipients: { reader: currentUserOnlineId },
        },
      },
      {
        multi: true,
      }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Array} chatRoomIds - chat room ids
 * @param {{ page, limit }} options - pagination options
 * @param {String} currentUserOnlineId - user id
 */
messageSchema.statics.getRecentConversation = async function (chatRoomIds, options, currentUserOnlineId) {
  try {
    return this.aggregate([
      { $match: { chatRoomId: { $in: chatRoomIds } } },
      {
        $group: {
          _id: '$chatRoomId',
          messageId: { $last: '$_id' },
          chatRoomId: { $last: '$chatRoomId' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          sender: { $last: '$sender' },
          createdAt: { $last: '$createdAt' },
          readByRecipients: { $last: '$readByRecipients' },
        },
      },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and
      // get me a user whose _id = sender
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      // do a join on another table called chatrooms, and
      // get me room details
      {
        $lookup: {
          from: 'chatrooms',
          localField: '_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: '$roomInfo' },
      { $unwind: '$roomInfo.userIds' },
      // do a join on another table called users
      {
        $lookup: {
          from: 'users',
          localField: 'roomInfo.userIds',
          foreignField: '_id',
          as: 'roomInfo.userProfile',
        },
      },
      { $unwind: '$readByRecipients' },
      // do a join on another table called users
      {
        $lookup: {
          from: 'users',
          localField: 'readByRecipients.reader',
          foreignField: '_id',
          as: 'readByRecipients.readByUser',
        },
      },

      {
        $group: {
          _id: '$roomInfo._id',
          messageId: { $last: '$messageId' },
          chatRoomId: { $last: '$chatRoomId' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          sender: { $last: '$sender' },
          readByRecipients: { $addToSet: '$readByRecipients' },
          roomInfo: { $addToSet: '$roomInfo.userProfile' },
          createdAt: { $last: '$createdAt' },
        },
      },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
    ]);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model('Message', messageSchema);
