FROM node:carbon

COPY ./docker/dapp/startup.sh /startup.sh
RUN chmod 755 /startup.sh

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

EXPOSE 8080