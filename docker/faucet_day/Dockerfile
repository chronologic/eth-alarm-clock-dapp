FROM node:carbon-alpine

COPY ./docker/faucet_day/startup.sh /startup.sh
RUN chmod 755 /startup.sh

RUN apk update && apk add --no-cache bash git

RUN npm install -g truffle@4.1.5

RUN git clone https://github.com/chronologic/DAY-testnet-faucet.git

WORKDIR ./DAY-testnet-faucet
COPY ./docker/ganache/truffle.js ./truffle.js

RUN npm install
