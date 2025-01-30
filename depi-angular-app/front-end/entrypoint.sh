#!/bin/sh

# Replace __API_URL__ with the actual API_URL from environment variables
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/main-*.js

# Start Nginx
exec "$@"
