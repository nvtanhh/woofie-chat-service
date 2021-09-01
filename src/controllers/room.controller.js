const pick = require('../utils/pick');
const { roomService, messageService } = require('../services');

const FirstTimeMessagesCount = 10;

const firstTimeGetMessageOptions = {
  skip: 0,
  limit: FirstTimeMessagesCount,
};

const getRecentChatRooms = async (req, res) => {
  try {
    const loggedUserId = req.userId;
    const options = pick(req.query, ['limit', 'skip', 'acceptEmptyChatRoom']);
    const roomsRaw = await roomService.getRecentChatRoomsByUserId(loggedUserId, options);
    let rooms = roomsRaw.map((room) => room.toJSON());
    await Promise.all(
      rooms.map(async (room, index) => {
        const messages = await messageService.getMessagesByRoomId(room.id, firstTimeGetMessageOptions);
        const messageViewModels = messages.map((message) => message.toJSON());
        rooms[index].messages = messageViewModels;
      })
    );

    if (!options.acceptEmptyChatRoom) {
      rooms = rooms.filter((room) => room.messages.length > 0);
    }

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
    if (creatorId === members.first) {
      return res.status(400).json({ error: 'You cannot add your self as a member.' });
    }
    members.push(creatorId);
    const chatRoom = await roomService.initiateChatRoom(members, creatorId, isGroup);
    const messages = await messageService.getMessagesByRoomId(chatRoom.id, firstTimeGetMessageOptions);
    const messageViewModels = messages.map((message) => message.toJSON());
    chatRoom.messages = messageViewModels;
    return res.status(200).json({ chatRoom });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  getRecentChatRooms,
  initiateChatRoom,
};
