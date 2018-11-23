FROM feedbacker-build

WORKDIR /app
RUN sh /prod/docker-build.sh

###

FROM node:10.13-alpine

WORKDIR /app

COPY --from=0 /app/server /app

CMD npm start -- --config config.json
