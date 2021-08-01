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
    const options = pick(req.query, ['limit', 'skip']);
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
    const chatRoom = await roomService.getChatRoomByRoomId(roomId);
    if (!chatRoom) {
      return res.status(400).json({ message: "Can't find your chat room!" });
    }
    const message = pick(req.body, ['content', 'type', 'description', 'createdAt']);
    const newMessage = (await messageService.createNewMessage(roomId, message, loggedInUserId)).toJSON();
    if (!chatRoom.isGroup) {
      const partnerId = chatRoom.name.replace(loggedInUserId, '').replace('_', '');
      socketManager.sendNewMessageToPrivateChat(partnerId, loggedInUserId, newMessage);
    }
    chatRoom.save();
    return res.status(201).json({ new_message: newMessage });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = { getConversationByRoomId, createNewMessage };
