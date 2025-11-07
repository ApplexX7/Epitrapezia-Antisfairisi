FROM node:20-alpine

RUN apk add --no-cache bash git

WORKDIR /app

COPY ./front-end/package*.json ./

COPY ./front-end ./

RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=development