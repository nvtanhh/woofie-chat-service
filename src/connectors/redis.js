/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const Redis = require('ioredis');
const config = require('../config/config');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

redisClient.on('error', function (error) {
  console.error(error);
});

redisClient.on('ready', () => {
  console.log('Connect to redis');
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
  console.log(`Active user ${userId}`);
  return redisClient.set(key, 'true', 'EX', 5 * 60);
}
/**
 * @param {string} userId
 */
function setInactiveUser(userId) {
  const key = `${redisPrefix.activeUser}${userId}`;
  console.log(`Inactive user ${userId}`);
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
