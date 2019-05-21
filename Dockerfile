FROM nginx:stable-alpine

ADD docker/nginx.conf /etc/nginx/conf.d/default.conf
ADD ./dist /app
