const mongoose = require('mongoose');

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
 * This method will create a new message
 *
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} sender - user who is posting the message
 */
messageSchema.statics.createNewMessage = async function (chatRoomId, message, sender) {
  const post = await this.create({
    chatRoomId,
    message: message.content,
    type: message.type,
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
};

/**
 * @param {String} chatRoomId - chat room id
 */
messageSchema.statics.getConversationByRoomId = async function (chatRoomId, options = {}) {
  return this.find({ chatRoomId })
    .sort('-createdAt', -1)
    .skip(options.page * options.limit)
    .limit(options.limit);
};

/**
 * @param {String} chatRoomId - chat room id
 * @param {String} currentUserOnlineId - user id
 */
messageSchema.statics.markMessageRead = async function (chatRoomId, currentUserOnlineId) {
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
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
