# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# VITE_ variables are embedded at build time — Railway passes them as build args
ARG VITE_API_BASE_URL=https://matchiq-api.up.railway.app/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove the default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx template — PORT will be substituted at startup
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy compiled assets from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy and enable the entrypoint that substitutes $PORT
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
