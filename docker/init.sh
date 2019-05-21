#!/bin/sh

echo "Using registry '$REGISTRY'"

find /etc/nginx/conf.d/ /app -type f -print0 \
    | xargs -0 sed -i "s@__REPLACED_BY_SED_DURING_RUNTIME__@${REGISTRY}@g"

cat /etc/nginx/conf.d/*
exec nginx -g "daemon off;"
