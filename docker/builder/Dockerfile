FROM node:10.13-alpine

COPY . /app/
WORKDIR /app

RUN sh /app/docker/builder/docker-build.sh

CMD npm start

