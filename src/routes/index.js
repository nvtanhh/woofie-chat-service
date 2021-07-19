/* eslint-disable no-console */
const express = require('express');
const chatRoute = require('./chat.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/chat',
    route: chatRoute,
  },
];

router.get('/ping', (req, res) => {
  res.status(200).json({ message: `pong` });
});

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
