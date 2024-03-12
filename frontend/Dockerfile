FROM node:lts as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM docker.io/library/nginx as react-nginx

COPY --from=build /app/dist /usr/share/nginx/html
# COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]