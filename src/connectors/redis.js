/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
import Redis from 'ioredis';

import { redis } from '../config/config';

export const redisClient = new Redis({
  host: redis.host,
  port: redis.port,
});

this.redisClient.on('error', function (error) {
  console.error(error);
});
this.redisClient.on('ready', () => {
  console.log('Connect to redis');
});

export const redisRefix = {
  accessToken: 'accessToken/',
  username: 'username/',
  activeUser: 'activeUser/',
  latestMessage: 'latestMessage/',
};

/**
 * @param {string} userId
 * @param {Redis.Redis} [redisClient]
 */
export function setActiveUser(userId, redisClient = null) {
  if (!redisClient) redisClient = this.redisClient;

  const key = `${this.redisRefix.activeUser}${userId}`;
  console.log(`Active user ${userId}`);
  return redisClient.set(key, 'true', 'EX', 5 * 60);
}
/**
 * @param {string} userId
 */
export function setDeacticeUser(userId) {
  const key = `${this.redisRefix.activeUser}${userId}`;
  console.log(`Deactive user ${userId}`);
  return this.redisClient.get(key);
}
/**
 * @param {string} userId
 * @returns {Promise<'true'|null>}
 */
export function getActiveUser(userId) {
  const key = `${this.redisRefix.activeUser}${userId}`;
  return this.redisClient.get(key);
}
