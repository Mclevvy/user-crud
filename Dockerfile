# Build the Ionic/Angular app, then serve the static output with nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# shortcut: runs as root; swap to nginxinc/nginx-unprivileged:alpine when the registry is reachable.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www /usr/share/nginx/html
EXPOSE 8100
