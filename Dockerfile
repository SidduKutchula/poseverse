# Multi-stage Docker build for MERN client & server
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./
COPY client/package*.json ./client/

# Install root & client dependencies
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps

# Copy full application code
COPY . .

# Build Vite client production bundle
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy package configurations and production node_modules
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy built frontend client assets and backend files from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/server ./server

# Expose API and web application port
EXPOSE 5000

ENV NODE_ENV=production

# Run start script
CMD ["npm", "start"]
