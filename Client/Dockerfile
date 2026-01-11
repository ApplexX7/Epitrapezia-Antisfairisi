FROM node:20-alpine

RUN apk add --no-cache bash git

WORKDIR /app

COPY ./package*.json ./

COPY ./ ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
