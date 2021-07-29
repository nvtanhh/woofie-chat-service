/* eslint-disable no-param-reassign */
const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('../config/logger');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

redisClient.on('error', function (error) {
  logger.error(error);
});

redisClient.on('ready', () => {
  logger.info('Connect to redis');
});

const redisPrefix = {
  accessToken: 'accessToken/',
  username: 'username/',
  activeUser: 'activeUser/',
  latestMessage: 'latestMessage/',
};

/**
 * @param {string} userId
 * @param {Redis.Redis} [redisClient]
 */
function setActiveUser(userId, client = null) {
  if (!client) client = redisClient;

  const key = `${redisPrefix.activeUser}${userId}`;
  logger.debug(`Active user ${userId}`);
  return redisClient.set(key, 'true', 'EX', 5 * 60);
}
/**
 * @param {string} userId
 */
function setInactiveUser(userId) {
  const key = `${redisPrefix.activeUser}${userId}`;
  logger.debug(`Inactive user ${userId}`);
  return redisClient.get(key);
}

/**
 * @param {string} userId
 * @returns {Promise<'true'|null>}
 */
function getActiveUser(userId) {
  const key = `${redisPrefix.activeUser}${userId}`;
  return redisClient.get(key);
}
module.exports = {
  redisClient,
  setActiveUser,
  setInactiveUser,
  getActiveUser,
};
