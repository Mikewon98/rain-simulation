# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the Vite project
COPY . .
RUN npm run build

# Production runner image
FROM node:22-alpine AS runner
WORKDIR /app

# Install 'serve' to host the static files
RUN npm install -g serve

# Create a non-root user for security (matching your Next.js preference)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 viteuser

# Copy the built static files from the builder stage
COPY --from=builder --chown=viteuser:nodejs /app/dist ./dist

USER viteuser

EXPOSE 3000

# Healthcheck to ensure 'serve' is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

# Serve the 'dist' directory on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

# # syntax=docker/dockerfile:1

# FROM node:22-bookworm-slim AS builder

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# FROM nginx:1.27-alpine AS production

# COPY --from=builder /app/dist /usr/share/nginx/html

# EXPOSE 80

# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
