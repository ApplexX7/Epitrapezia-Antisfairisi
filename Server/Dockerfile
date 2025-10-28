FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++ bash sqlite-dev

COPY ./Backend/package*.json ./
RUN npm install
RUN npm install -g nodemon ts-node

COPY ./Backend ./
EXPOSE 8080

CMD ["npm", "run", "dev"]
