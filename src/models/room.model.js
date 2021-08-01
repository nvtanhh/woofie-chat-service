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

roomSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  return next();
});

roomSchema.method('toJSON', function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
