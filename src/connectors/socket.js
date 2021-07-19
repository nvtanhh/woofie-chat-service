/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const socketio = require('socket.io');
const redis = require('socket.io-redis');
const { allowOrgins } = require('../config/config');

// const { Member } = require('@models');
const { redisClient, setActiveUser, setDeacticeUser } = require('./redis');
const { getUser } = require('./socket_auth');

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
      cors: {
        origin: allowOrgins,
        methods: ['GET', 'POST'],
      },
    });

    const subClient = redisClient.duplicate();
    this._io.adapter(
      redis({
        pubClient: redisClient,
        subClient,
      })
    );

    this._io.use(this._checkUser);
    this._io.on('connection', this._connection);
  }

  /**
   * @param {socketio.Socket} socket
   * @param {Function} next
   */
  _checkUser = async (socket, next) => {
    try {
      if (!socket.handshake.query.token) {
        return next(new Error('Unauthorization'));
      }

      try {
        if (socket.handshake.query.token) {
          const userUuid = await getUser(socket.handshake.query.token);
          if (!userUuid) {
            throw new Error();
          }
          this.users[socket.id] = userUuid;
        } else throw new Error();
        next();
      } catch (_) {
        socket.emit('authenticated', { success: false });
        next(new Error('Unauthorization'));
      }
    } catch (error) {
      console.error(error);
      socket.emit('authenticated', { success: false });
      next(new Error('Internal Error'));
    }
  };

  /**
   * @param {socketio.Socket} socket
   */
  _connection = async (socket) => {
    // join to room of this user to support multi devices
    await socket.join(this._getUserRoom(this.users[socket.id]));

    await setActiveUser(this.users[socket.id]);

    // event fired when the chat room is disconnected
    socket.on('disconnect', async () => {
      await setDeacticeUser(this.users[socket.id]);
      delete this.users[socket.id];
    });

    socket.emit('authenticated', { success: true });
  };

  /**
   * @param {string} id user id
   * @returns {string}
   */
  _getUserRoom(id) {
    return `/user-chat/${id}`;
  }

  /**
   * @param {string} id user id
   * @returns {string}
   */
  _getGroup(id) {
    return `/group/${id}`;
  }

  /**
   * @param {string} userId
   * @param {string} eventName
   * @param  {...any} data
   * @returns
   */
  sendUserEvent(userId, eventName, ...data) {
    return this._io.to(this._getUserRoom(userId)).emit(eventName, ...data);
  }

  /**
   * @param {number} groupId
   * @param {string} eventName
   * @param  {...any} data
   * @returns
   */
  sendGroupEvent(groupId, eventName, ...data) {
    return this._io.to(this._getGroup(groupId)).emit(eventName, ...data);
  }

  sendNewMessage(groupId, ...data) {
    return this.sendGroupEvent(groupId, 'NewMessage', ...data);
  }

  sendNewMember(groupId, ...data) {
    return this.sendGroupEvent(groupId, 'NewMember', ...data);
  }

  sendViewedMessage(groupId, ...data) {
    return this.sendGroupEvent(groupId, 'ViewedMessage', ...data);
  }

  sendUpdatedGroup(groupId, ...data) {
    return this.sendGroupEvent(groupId, 'UpdatedGroup', ...data);
  }
}
const socketManager = new SocketManager();

module.exports = socketManager;
