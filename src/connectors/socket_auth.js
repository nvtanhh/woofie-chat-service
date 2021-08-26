/* eslint-disable no-console */ /* eslint-disable prettier/prettier */
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const client = jwksClient({
  jwksUri: config.jwt.jwksUri,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    try {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    } catch (e) {
      callback(e, null);
    }
  });
}

const options = { audience: config.jwt.audience, issuer: config.jwt.issuer, algorithms: config.jwt.algorithms };

/**
 * @param {string} token
 * @returns {Promise<import('@t/auth').UserInfo>}
 */
const getUser = async function (token) {
  return new Promise((resolve) => {
    jwt.verify(token, getKey, options, function (err, payload) {
      if (!err && payload && payload.sub) {
        const userUuid = payload.sub;
        resolve(userUuid);
      } else {
        resolve(null);
      }
    });
  });
};

module.exports = { getUser };
