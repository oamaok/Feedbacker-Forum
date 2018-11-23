FROM node:10.13-alpine

COPY .git /app/.git
COPY . /app/
WORKDIR /app

RUN sh /app/docker/builder/docker-build.sh

