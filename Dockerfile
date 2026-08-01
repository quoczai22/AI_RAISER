FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY src ./src
COPY tests ./tests

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
