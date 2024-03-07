FROM node:lts as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx tsc -p .

EXPOSE 3000

CMD ["node", "/app/build/index.js"]