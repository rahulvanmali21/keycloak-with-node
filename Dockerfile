FROM node:slim

WORKDIR /usr/src/app 

COPY package*.json .

RUN npm ci

COPY . .

ENV SERVER_POST 3000

EXPOSE $SERVER_POST

CMD [ "npm" ,"run", "start" ]