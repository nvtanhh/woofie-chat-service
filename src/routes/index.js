/* eslint-disable no-console */
const express = require('express');
const messageRoute = require('./message.route');
const roomRoute = require('./room.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/room',
    route: roomRoute,
  },
  {
    path: '/message',
    route: messageRoute,
  },
];

router.get('/ping', (req, res) => {
  res.status(200).json({ message: `pong` });
});

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
