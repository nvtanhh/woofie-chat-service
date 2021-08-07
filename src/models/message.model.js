const mongoose = require('mongoose');

// const readByRecipientSchema = new mongoose.Schema(
//   {
//     reader: String,
//     readAt: {
//       type: Date,
//       default: Date.now(),
//     },
//   },
//   {
//     timestamps: false,
//   }
// );
// readByRecipients: [readByRecipientSchema],

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    content: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.String,
    type: {
      type: String,
      enum: ['T', 'I', 'V', 'P'], // text, image, video, post
      default: 'T',
    },
    sender: String,
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
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
