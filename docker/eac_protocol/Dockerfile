FROM node:carbon-alpine

COPY ./docker/eac_protocol/startup.sh /startup.sh
RUN chmod 755 /startup.sh

RUN apk update && apk add --no-cache bash git python alpine-sdk

RUN npm install -g truffle@4.1.7

RUN git clone https://github.com/ethereum-alarm-clock/ethereum-alarm-clock.git

WORKDIR ./ethereum-alarm-clock
RUN git checkout tags/1.0.0-beta.2

COPY ./docker/ganache/truffle.js ./truffle.js
COPY ./docker/eac_protocol/extractContractsInfo.js ./extractContractsInfo.js

RUN npm install
