# Build stage
FROM node:lts-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/core/package.json ./packages/core/package.json
COPY packages/services/package.json ./packages/services/package.json

# Install all dependencies
RUN npm ci

# Copy source code
COPY packages/core/ ./packages/core/
COPY packages/services/ ./packages/services/

# Build the service
WORKDIR /app/packages/services
RUN npm run build

# Production stage
FROM node:lts-alpine as production

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json* ./
COPY packages/services/package.json ./packages/services/package.json
COPY packages/core/package.json ./packages/core/package.json
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/packages/services/dist ./dist
COPY --from=builder /app/packages/services/package.json ./

EXPOSE 3000
CMD ["npm", "run", "start"]