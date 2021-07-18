/* eslint-disable no-console */
const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const auth = require('../middlewares/auth');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

router.get('/ping', auth(), (req, res) => {
  // const message = `API called for user with scope '${req.claims.scope}' and role '${req.claims.role}'`;
  res.status(200).json({ message: 'pong' });
});

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
