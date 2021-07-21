const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
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

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
