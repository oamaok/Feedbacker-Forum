FROM node:10.13-alpine

COPY . /app/
WORKDIR /app

RUN sh /app/docker/build/docker-build.sh

CMD npm start

