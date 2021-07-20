const pick = require('../utils/pick');
const { roomService, messageService } = require('../services');

const FirstTimeMessagesCount = 15;

const getRecentChatRooms = async (req, res) => {
  try {
    const loggedUserId = req.userId;
    const options = pick(req.query, ['limit', 'page']);
    const rooms = await roomService.getRecentChatRoomsByUserId(loggedUserId, options);
    const firstTimeGetMessageOptions = {
      page: 0,
      limit: FirstTimeMessagesCount,
    };
    rooms.forEach(async (room) => {
      const messages = await messageService.getMessagesByRoomId(room._id, firstTimeGetMessageOptions);
      rooms[room].messages = messages;
    });

    return res.status(200).json({ success: true, conversation: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const initiate = async (req, res) => {
  try {
    const { members, isGroup } = req.body;
    const creatorId = req.userId;
    members.push(creatorId);
    const chatRoom = await roomService.initiateChatRoom(members, creatorId, isGroup);
    return res.status(200).json({ success: true, chatRoom });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

module.exports = {
  getRecentChatRooms,
  initiate,
};
