# ---------- STAGE 1: build ----------
FROM node:16-alpine AS builder

WORKDIR /app

# Сначала только манифесты зависимостей — ради кеша
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Сборка фронтенда (должна собрать в папку build)
RUN npm run build


# ---------- STAGE 2: nginx ----------
FROM nginx:latest AS runner

# Удаляем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Кладём наш конфиг
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Кладём билд фронта в стандартную директорию nginx
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Стандартный старт nginx (команду менять не нужно)
CMD ["nginx", "-g", "daemon off;"]
