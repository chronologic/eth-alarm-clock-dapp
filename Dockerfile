FROM node:carbon-alpine

RUN apk update && apk add --no-cache bash git jq nano python alpine-sdk nginx

WORKDIR /usr/src/app
RUN git clone https://github.com/chronologic/eth-alarm-clock-dapp.git .

# Replace later with the master branch
RUN git checkout docker-image 

RUN npm install
RUN npm run build

WORKDIR /usr/src/app/dist
RUN ls -l

COPY . /usr/share/nginx/html

EXPOSE 80