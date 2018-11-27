FROM nginx:1.15.6-alpine

RUN apk update && apk add --no-cache bash git jq nano python alpine-sdk nginx nodejs nodejs-npm

WORKDIR /usr/src/app

RUN git clone https://github.com/chronologic/eth-alarm-clock-dapp.git . --single-branch -b develop

RUN npm install
RUN npm run build:dappnode:dev

RUN rm -rf /usr/share/nginx/html/*
RUN cp -r dist/* /usr/share/nginx/html/

# Fixes an error with routing in Nginx
RUN sed -i '11itry_files $uri /index.html;' /etc/nginx/conf.d/default.conf

RUN rm -rf dist node_modules .git

EXPOSE 80
