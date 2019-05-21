FROM nginx:stable-alpine

ADD docker/nginx.conf /etc/nginx/conf.d/default.conf
ADD docker/init.sh /usr/local/bin/init.sh
ADD dist /app

ENTRYPOINT /usr/local/bin/init.sh
