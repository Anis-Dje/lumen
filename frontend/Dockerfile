# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Node build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL is intentionally left empty so the browser uses relative /api
# paths (served through Nginx's reverse-proxy block). If you deploy to a
# different domain, override this build-arg:
#   docker build --build-arg VITE_API_URL=https://api.yourdomain.com
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Nginx static file server
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="TechVault Frontend"
LABEL org.opencontainers.image.description="React SPA + Nginx"

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
