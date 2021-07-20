const makeValidation = require('@withvoid/make-validation');
const ChatRoomModel = require('../models/room.model');
const MessageModel = require('../models/message.model');
const socketManager = require('../connectors/socket');

const FirstTimeMessagesCount = 15;

const initiate = async (req, res) => {
  try {
    const validation = makeValidation((types) => ({
      payload: req.body,
      checks: {
        members: {
          type: types.array,
          options: { unique: true, empty: false, stringOnly: true },
        },
        isGroup: { type: types.boolean },
      },
    }));
    if (!validation.success) return res.status(400).json({ ...validation });

    const { members, isGroup } = req.body;
    const creatorId = req.userId;
    members.push(creatorId);
    const chatRoom = await ChatRoomModel.initiateChat(members, creatorId, isGroup);
    return res.status(200).json({ success: true, chatRoom });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const sendMessage = async (req, res) => {
  try {
    const validation = makeValidation((types) => ({
      payload: req.body,
      checks: {
        content: { type: types.string },
        type: { type: types.string },
        receiverId: { type: types.string },
      },
    }));
    if (!validation.success) return res.status(400).json({ ...validation });

    const loggedInUserId = req.userId;
    const chatRoom = ChatRoomModel.initiateChat([req.body.receiverId], loggedInUserId, false);
    if (!chatRoom) {
      return res.status(400).json({ message: 'Initiate chat room failed!' });
    }
    const roomId = chatRoom.chatRoomId;

    const messagePayload = {
      content: req.body.content,
      type: req.body.type,
    };
    const newMessage = await MessageModel.createNewMessage(roomId, messagePayload, loggedInUserId);
    if (newMessage) {
      socketManager.sendUserEvent(loggedInUserId, 'new_message', newMessage.toJSON());
    }
    return res.status(200).json({ success: true, newMessage });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const getRecentConversation = async (req, res) => {
  try {
    const currentLoggedUser = req.userId;
    const options = {
      page: parseInt(req.query.page, 10) || 0,
      limit: parseInt(req.query.limit, 10) || 10,
    };
    const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser, options);
    const firstTimeGetMessageOptions = {
      page: 0,
      limit: FirstTimeMessagesCount,
    };
    rooms.forEach(async (room) => {
      const messages = await MessageModel.getConversationByRoomId(room._id, firstTimeGetMessageOptions);
      rooms[room].messages = messages;
    });

    return res.status(200).json({ success: true, conversation: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const getConversationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoomModel.getChatRoomByRoomId(roomId);
    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'No room exists for this id',
      });
    }
    const options = {
      page: parseInt(req.query.page, 10) || 0,
      limit: parseInt(req.query.limit, 10) || 10,
    };
    const conversation = await MessageModel.getConversationByRoomId(roomId, options);
    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
const markConversationReadByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoomModel.getChatRoomByRoomId(roomId);
    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'No room exists for this id',
      });
    }

    const currentLoggedUser = req.userId;
    const result = await MessageModel.markMessageRead(roomId, currentLoggedUser);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
const deleteRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoomModel.remove({ _id: roomId });
    const messages = await MessageModel.remove({ chatRoomId: roomId });
    return res.status(200).json({
      success: true,
      message: 'Operation performed successfully',
      deletedRoomsCount: room.deletedCount,
      deletedMessagesCount: messages.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
const deleteMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await MessageModel.remove({ _id: messageId });
    return res.status(200).json({
      success: true,
      deletedMessagesCount: message.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

module.exports = {
  initiate,
  sendMessage,
  getRecentConversation,
  getConversationByRoomId,
  markConversationReadByRoomId,
  deleteRoomById,
  deleteMessageById,
};
