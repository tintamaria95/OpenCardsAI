FROM node:lts as build
ENV REACT_APP_API_URL="api.ocg.martinld.fr"
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM docker.io/library/nginx as react-nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]