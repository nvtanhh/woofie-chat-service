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
    content: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['T', 'I'],
      default: 'T',
    },
    sender: String,
    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: true,
  }
);

messageSchema.method('toJSON', function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
