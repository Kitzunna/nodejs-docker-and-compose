# ---------- STAGE 1: build ----------
FROM node:16-alpine AS builder

WORKDIR /app

# Для сборки bcrypt и прочих нативных модулей
RUN apk add --no-cache python3 make g++

# Сначала только package*.json, чтобы кешировать зависимости
COPY package*.json ./

# Устанавливаем все зависимости (включая dev) для сборки
RUN npm ci

# Копируем остальной исходный код
COPY . .

# Сборка TypeScript -> dist
RUN npm run build

# Оставляем только прод-зависимости
RUN npm prune --production


# ---------- STAGE 2: runtime ----------
FROM node:16-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Ставим pm2 глобально
RUN npm install -g pm2

# Копируем только то, что нужно для работы
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY ecosystem.config.js ./ecosystem.config.js

# Порт сервиса (как в .env: PORT=3001)
EXPOSE 3001

# Запускаем через pm2-runtime
CMD ["pm2-runtime", "ecosystem.config.js"]
