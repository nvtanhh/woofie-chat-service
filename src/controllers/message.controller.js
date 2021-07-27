const pick = require('../utils/pick');
const { roomService, messageService } = require('../services');
const socketManager = require('../connectors/socket');

const getConversationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    let room;
    try {
      room = await roomService.getChatRoomByRoomId(roomId);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
    if (!room) {
      return res.status(400).json({
        message: 'No room exists for this id',
      });
    }
    const options = pick(req.query, ['limit', 'page']);
    const messages = await messageService.getMessagesByRoomId(roomId, options);
    const messageViewModels = messages.map((message) => message.toJSON());
    return res.status(200).json({ messages: messageViewModels });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const createNewMessage = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const { roomId } = req.params;
    const chatRoom = roomService.getChatRoomByRoomId(roomId);
    if (!chatRoom) {
      return res.status(400).json({ message: 'Initiate chat room failed!' });
    }
    const message = pick(req.body, ['content', 'type']);
    const newMessage = await messageService.createNewMessage(roomId, message, loggedInUserId);
    const newMessageJson = newMessage.toJSON();
    if (newMessage) {
      socketManager.sendUserEvent(loggedInUserId, 'new-message', newMessageJson);
    }
    return res.status(201).json({ newMessage });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = { getConversationByRoomId, createNewMessage };
