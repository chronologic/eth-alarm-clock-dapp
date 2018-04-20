FROM trufflesuite/ganache-cli:v6.0.3

COPY ./docker/ganache/startup.sh /startup.sh
RUN chmod 755 /startup.sh

RUN apk add --no-cache coreutils