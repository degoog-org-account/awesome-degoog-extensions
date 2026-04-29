FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY index.html store.html extension.html stores.json README.md ./
COPY assets ./assets

EXPOSE 80
