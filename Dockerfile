# ---- builder ----
FROM node:22-alpine3.21 AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

COPY apps/api ./apps/api

RUN yarn workspace @taskhub/api prisma:generate
RUN yarn workspace @taskhub/api build

# ---- runner ----
FROM node:22-alpine3.21

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY apps/api/prisma ./apps/api/prisma

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
