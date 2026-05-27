FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY docker-entrypoint.sh ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV RUN_SEED=true

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
