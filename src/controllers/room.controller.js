const pick = require('../utils/pick');
const { roomService, messageService } = require('../services');

const FirstTimeMessagesCount = 10;

// const _toMessageViewModel = (message, userId) => {
//   return {
//     content: message.content,
//     type: message.type,
//     isMine: message.sender === userId,
//     createdAt: message.createdAt,
//   };
// };

const getRecentChatRooms = async (req, res) => {
  try {
    const loggedUserId = req.userId;
    const options = pick(req.query, ['limit', 'page']);
    const rooms = await roomService.getRecentChatRoomsByUserId(loggedUserId, options);
    const firstTimeGetMessageOptions = {
      page: 0,
      limit: FirstTimeMessagesCount,
    };
    await Promise.all(
      rooms.map(async (room, index) => {
        const messages = await messageService.getMessagesByRoomId(room._id, firstTimeGetMessageOptions);
        // const messageViewModels = messages.map((message) => _toMessageViewModel(message, loggedUserId));
        rooms[index].messages = messages;
      })
    );

    return res.status(200).json({ rooms });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const initiateChatRoom = async (req, res) => {
  try {
    const { members, isGroup } = req.body;
    const creatorId = req.userId;
    if (members.length === 0) {
      return res.status(400).json({ error: 'You must add at least one member to the chat room.' });
    }
    members.push(creatorId);
    const chatRoom = await roomService.initiateChatRoom(members, creatorId, isGroup);
    return res.status(200).json({ chatRoom });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  getRecentChatRooms,
  initiateChatRoom,
};
