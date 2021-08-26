/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const socketio = require('socket.io');
const redis = require('socket.io-redis');
const { allowOrigins } = require('../config/config');

// const { Member } = require('@models');
const { redisClient, setActiveUser, setInactiveUser } = require('./redis');
const { getUser } = require('./socket_auth');
const logger = require('../config/logger');

class SocketManager {
  constructor() {
    /** @type {{[k: string]: string}} */
    this.users = {};
  }

  init(server) {
    /** @type {socketio.Server} */
    this._io = socketio(server, {
      allowEIO3: true,
      destroyUpgrade: false,
      // cors: {
      //   origin: allowOrigins,
      //   methods: ['GET', 'POST'],
      // },
    });

    const subClient = redisClient.duplicate();
    this._io.adapter(
      redis({
        pubClient: redisClient,
        subClient,
      })
    );

    this._io.use(this._checkUser);
    this._io.on('connection', this._onConnection);
  }

  /**
   * @param {socketio.Socket} socket
   * @param {Function} next
   */
  _checkUser = async (socket, next) => {
    const { token } = socket.handshake.query;
    if (token) {
      let userUuid;
      await getUser(token).then((user) => {
        userUuid = user;
        if (userUuid) {
          this.users[socket.id] = userUuid;
          logger.info('Socket Authorized User ===> OK');
          next();
        }
      });
      if (userUuid) {
        return;
      }
    }
    logger.error('Socket Unauthorized User');
    socket.emit('authenticated', { status: true });
    next(new Error('unauthorization'));
  };

  /**
   * @param {socketio.Socket} socket
   */
  _onConnection = async (socket) => {
    // join to room of this user to support multi devices
    if (this.users[socket.id]) {
      await socket.join(this.users[socket.id]);
      await setActiveUser(this.users[socket.id]);
      logger.debug(`Socket Connected ====> ${this.users[socket.id]}`);

      // event fired when the chat room is disconnected
      socket.on('disconnect', async () => {
        await setInactiveUser(this.users[socket.id]);
        socket.leave(this.users[socket.id]);
        delete this.users[socket.id];
      });

      socket.on('typing', (data) => this._handleTypingEvent(data, this.users[socket.id]));

      socket.emit('authenticated', { success: true });
    } else {
      socket.emit('authenticated', { success: false });
    }
  };

  _handleTypingEvent(comingData, data) {
    const { receiver, isTyping } = comingData;
    this.sendUserEvent(receiver, 'is-typing', {
      isTyping,
      userUuid: data,
    });
  }

  sendNewMessageToPrivateChat(receiver, messageCreatorId, message) {
    this.sendUserEvent(receiver, 'new-message', { creator: messageCreatorId, message });
  }

  /**
   * @param {string} userId
   * @param {string} eventName
   * @param  {...any} data
   * @returns
   */
  sendUserEvent(userId, eventName, ...data) {
    if (Object.values(this.users).indexOf(userId) > -1) return this._io.to(userId).emit(eventName, ...data);
  }

  // /**
  //  * @param {number} groupId
  //  * @param {string} eventName
  //  * @param  {...any} data
  //  * @returns
  //  */
  // sendGroupEvent(groupId, eventName, ...data) {
  //   return this._io.to(this._getGroup(groupId)).emit(eventName, ...data);
  // }

  // sendNewMember(groupId, ...data) {
  //   return this.sendGroupEvent(groupId, 'NewMember', ...data);
  // }

  // sendViewedMessage(groupId, ...data) {
  //   return this.sendGroupEvent(groupId, 'ViewedMessage', ...data);
  // }

  // sendUpdatedGroup(groupId, ...data) {
  //   return this.sendGroupEvent(groupId, 'UpdatedGroup', ...data);
  // }
}
const socketManager = new SocketManager();

module.exports = socketManager;
