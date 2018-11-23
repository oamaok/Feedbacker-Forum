FROM feedbacker-build

FROM node:10.13-alpine

COPY --from=0 /app /app
WORKDIR /app/server

CMD npm run watch
