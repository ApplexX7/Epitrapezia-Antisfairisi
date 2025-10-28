FROM nginx:stable-alpine

# Install openssl
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
RUN openssl req -x509 -nodes -subj "/C=MA/ST=KH/O=1337, Inc./CN=WebPong.1337.ma" \
    -keyout /etc/nginx/ssl/webpong.key -out /etc/nginx/ssl/webpong.crt

# Set permissions (optional)
RUN chmod 600 /etc/nginx/ssl/webpong.*

# Copy custom Nginx config
COPY ./config/nginx.conf /etc/nginx/nginx.conf

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
