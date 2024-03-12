FROM node:lts as build

WORKDIR /app

COPY package*.json ./

# "RUN npm ci" brings error, probably due to podman-compose network issue
RUN npm i 

COPY . .

RUN npm run build

FROM docker.io/library/nginx as react-nginx

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]