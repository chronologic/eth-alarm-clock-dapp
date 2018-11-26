FROM nginx:alpine

RUN apk update && apk add --no-cache bash git jq nano python alpine-sdk nginx nodejs nodejs-npm

WORKDIR /usr/src/app

# TO-DO BEFORE MERGING: REPLACE dappnode-integration WITH develop OR master
RUN git clone https://github.com/chronologic/eth-alarm-clock-dapp.git . --single-branch -b dappnode-integration

RUN npm install
RUN npm run build:dappnode:dev

RUN rm -rf /usr/share/nginx/html/*
RUN cp -r dist/* /usr/share/nginx/html/

RUN rm -rf dist node_modules .git

EXPOSE 80
