const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');

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

router.get('/ping', (_, res) => res.status(200).json({ message: 'pong' }));

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
