FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/index.js ./
COPY backend/src ./src
COPY scripts/seed.js /app/scripts/seed.js

ENV NODE_ENV=production
EXPOSE 9000

CMD ["node", "index.js"]
