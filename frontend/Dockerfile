FROM node:lts as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["/bin/bash", "echo", "Built HTLM/JS files in ./frontend/dist/"]
