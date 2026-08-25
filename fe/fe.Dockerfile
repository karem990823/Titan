# Etapa 1: build
FROM node:20-slim AS build
WORKDIR /app

# Habilita pnpm vía corepack (ya incluido en Node 20, sin instalar nada extra)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-lock.yaml ./
# --frozen-lockfile: falla si package.json y pnpm-lock.yaml no coinciden,
# equivalente en espíritu a "npm ci" (instalación reproducible, sin sorpresas)
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm run build

# Etapa 2: servir con nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
