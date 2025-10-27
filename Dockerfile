# Unified Dockerfile - Frontend + Backend in one container
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Build Angular app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:22-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm install typescript ts-node @types/node

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build backend
RUN npm run build

# Copy built frontend into backend's public directory
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./public

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose single port
EXPOSE 3000

# Start the unified server
CMD ["node", "dist/index.js"]
