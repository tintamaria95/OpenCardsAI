FROM docker.io/library/nginx as webserver
COPY ./build /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]