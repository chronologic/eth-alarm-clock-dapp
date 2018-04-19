FROM node:carbon-alpine

RUN apk update && apk add --no-cache bash git jq nano python alpine-sdk

COPY ./docker/dapp/startup.sh /startup.sh
RUN chmod 755 /startup.sh

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

EXPOSE 8080