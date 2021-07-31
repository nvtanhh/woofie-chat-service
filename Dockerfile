FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

USER node

RUN npm install pm2 -g
RUN npm install --production


COPY --chown=node:node . .

CMD ["npm","start"]

EXPOSE 3000
