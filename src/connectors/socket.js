/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { allowOrgins } from '../config/config';

const socketio = require('socket.io');
const redis = require('socket.io-redis');

// const { Member } = require('@models');
const { redisClient, setActiveUser, setDeacticeUser } = require('./redis');
const { getUser, parseJWT } = require('./auth');

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
   * @param {socketio.Socket} client
   * @param {Function} next
   */
  _checkUser = async (client, next) => {
    try {
      if (!client.handshake.query.access_token && !client.handshake.query.jwt_token) {
        return next(new Error('Unauthorization'));
      }

      try {
        if (client.handshake.query.access_token) {
          const info = await getUser(client.handshake.query.access_token);
          this.users[client.id] = info.uuid;
        } else if (client.handshake.query.jwt_token) {
          const info = parseJWT(client.handshake.query.jwt_token);
          this.users[client.id] = info.user_id;
        } else throw new Error();
        next();
      } catch (_) {
        client.emit('NewConnection', { success: false });
        next(new Error('Unauthorization'));
      }
    } catch (error) {
      console.error(error);
      client.emit('NewConnection', { success: false });
      next(new Error('Internal Error'));
    }
  };

  /**
   * @param {socketio.Socket} client
   */
  _connection = async (client) => {
    // join to room of this user to support multi devices
    await client.join(this._getUserRoom(this.users[client.id]));

    await setActiveUser(this.users[client.id]);

    // event fired when the chat room is disconnected
    client.on('disconnect', async () => {
      // for (const room of client.rooms) {
      //   if (typeof room === 'string') {
      //     await client.leave(room);
      //   }
      // }

      await setDeacticeUser(this.users[client.id]);
      delete this.users[client.id];
    });

    client.on('join-group-chat', async (id) => {
      // const m = await Member.findOne({
      //   where: {
      //     member_id: this.users[client.id],
      //     group_id: id,
      //   },
      // });
      // if (m) {
      //   console.log(`WS: user ${this.users[client.id]} join group ${id}`);
      //   await client.join(this._getGroup(id));
      //   client.emit('join-group-chat', { success: true });
      // } else client.emit('join-group-chat', { success: false });
    });
    client.on('leave-group-chat', async (id) => {
      const room = this._getGroup(id);
      if (client.rooms.has(room)) {
        console.log(`WS: user ${this.users[client.id]} leave group ${id}`);
        await client.leave(room);

        client.emit('leave-group-chat', { success: true });
      } else client.emit('leave-group-chat', { success: false });
    });

    client.emit('NewConnection', { success: true });
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

exports.socketManager = new SocketManager();
