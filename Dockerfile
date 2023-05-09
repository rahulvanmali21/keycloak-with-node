FROM node:slim

WORKDIR /usr/src/app 

COPY package*.json .

RUN npm ci

COPY . .

ENV SERVER_PORT 3000

EXPOSE $SERVER_PORT

CMD [ "npm" ,"run", "start" ]