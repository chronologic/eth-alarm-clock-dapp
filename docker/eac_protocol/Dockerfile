FROM node:8.0.0-alpine

COPY ./docker/eac_protocol/startup.sh /startup.sh
RUN chmod 755 /startup.sh

RUN apk update && apk upgrade && apk add --no-cache bash git

RUN npm install -g truffle@4.1.5

RUN git clone https://github.com/ethereum-alarm-clock/ethereum-alarm-clock.git

WORKDIR ./ethereum-alarm-clock
COPY ./docker/ganache/truffle.js ./truffle.js

RUN npm install
