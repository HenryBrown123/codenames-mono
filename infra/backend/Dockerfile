# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./

# Copy package.json files for each workspace
COPY shared/package.json shared/tsconfig.json ./shared/
COPY backend/package.json backend/tsconfig.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including root devDeps for tsc)
RUN npm ci

# Copy source files
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first, then backend
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install production dependencies only (from root to include shared root deps)
RUN npm ci --omit=dev

# Copy built output
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Copy shared package.json (needed for exports resolution)
COPY shared/package.json ./shared/
COPY shared/tsconfig.json ./shared/

# Copy any static data files the backend needs at runtime
COPY backend/src/shared/db/startpoint.json ./backend/src/shared/db/startpoint.json

WORKDIR /app/backend

# Create empty .env so loadEnvFromPackageDir() doesn't throw;
# actual env vars are injected by Docker Compose
RUN touch .env

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
