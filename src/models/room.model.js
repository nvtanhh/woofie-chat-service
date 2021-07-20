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

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
roomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  const room = await this.findOne({ _id: roomId });
  return room;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
