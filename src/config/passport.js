const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('./config');
// const { tokenTypes } = require('./tokens');
// const { User } = require('../models');

const jwtOptions = {
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secretOrKeyProvider: jwksRsa.passportJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.jwt.jwksUri,
  }),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

  // Validate the audience and the issuer.
  audience: config.jwt.audience,
  issuer: config.jwt.issuer,
  algorithms: config.jwt.algorithms,
};

const jwtVerify = async (payload, done) => {
  try {
    if (!(payload && payload.sub)) {
      return done(null, false);
    }
    const user = payload.sub;
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
