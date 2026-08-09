FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY vite.config.js ./
RUN npm run frontend:build
RUN npm prune --omit=dev

FROM node:22-alpine

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src

ENV PORT=8080
EXPOSE 8080

USER node

CMD ["node", "server.js"]
