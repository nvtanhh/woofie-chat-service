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

const redisRefix = {
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

  const key = `${redisRefix.activeUser}${userId}`;
  console.log(`Active user ${userId}`);
  return redisClient.set(key, 'true', 'EX', 5 * 60);
}
/**
 * @param {string} userId
 */
function setDeacticeUser(userId) {
  const key = `${redisRefix.activeUser}${userId}`;
  console.log(`Deactive user ${userId}`);
  return redisClient.get(key);
}
/**
 * @param {string} userId
 * @returns {Promise<'true'|null>}
 */
function getActiveUser(userId) {
  const key = `${redisRefix.activeUser}${userId}`;
  return redisClient.get(key);
}
module.exports = {
  redisClient,
  redisRefix,
  setActiveUser,
  setDeacticeUser,
  getActiveUser,
};
