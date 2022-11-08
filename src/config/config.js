const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_JWKS_URI: Joi.string().required().description('JWKS url api endpoint'),
    JWT_AUDIENCE: Joi.string().required(),
    JWT_ISSUER: Joi.string().required(),
    JWT_ALGORITHMES: Joi.string().required(),
    REDIS_HOST: Joi.string().required().description('Redis host'),
    REDIS_PORT: Joi.number().required().description('Redis port'),
    ALLOW_ORIGINS: Joi.string().empty('').default('*').description('Allowed origins for CORS'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    jwksUri: envVars.JWT_JWKS_URI,
    audience: envVars.JWT_AUDIENCE,
    issuer: envVars.JWT_ISSUER,
    algorithms: envVars.JWT_ALGORITHMES.split(' '),
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
  },
  allowOrigins: envVars.ALLOW_ORIGINS ?? '*',
};
