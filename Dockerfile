FROM nginx:alpine

RUN apk update && apk add --no-cache bash git jq nano python alpine-sdk nginx nodejs nodejs-npm

WORKDIR /usr/src/app
RUN git clone https://github.com/chronologic/eth-alarm-clock-dapp.git .

# Replace later with the master branch
RUN git checkout docker-image

RUN npm install
RUN npm run build

RUN rm -rf /usr/share/nginx/html/*
RUN cp -r dist/* /usr/share/nginx/html/

RUN npm run cleanup
