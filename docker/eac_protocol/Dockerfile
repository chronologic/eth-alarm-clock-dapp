FROM node:8.0.0-alpine

COPY ./docker/eac_protocol/startup.sh /startup.sh
RUN chmod 755 /startup.sh

RUN apk update && apk upgrade && apk add --no-cache bash git

RUN npm install -g truffle@4.0.7

RUN git clone https://github.com/ethereum-alarm-clock/ethereum-alarm-clock.git

WORKDIR ./ethereum-alarm-clock
RUN git checkout tags/0.9.3

COPY ./docker/ganache/truffle.js ./truffle.js
COPY ./docker/eac_protocol/getContractsInfo.js ./getContractsInfo.js

RUN npm install
