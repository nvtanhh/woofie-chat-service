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
