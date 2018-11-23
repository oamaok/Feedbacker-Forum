FROM feedbacker-build

RUN npm --prefix client run build

###

FROM nginx:alpine

COPY docker/production/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=0 /app/client/build /app/build
WORKDIR /app
