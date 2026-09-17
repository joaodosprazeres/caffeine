# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# O npm 10.8.x (padrão da imagem node:20) tem um bug conhecido onde falhas de
# rede durante o fetch dos pacotes são engolidas e o processo sai com exit 0
# ("Exit handler never called!"), mascarando builds quebrados. Atualizar o
# npm corrige a propagação correta do erro.
RUN npm install -g npm@11 && npm ci

COPY . .

# Variáveis VITE_* são embutidas no bundle em tempo de build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- imagem final ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
