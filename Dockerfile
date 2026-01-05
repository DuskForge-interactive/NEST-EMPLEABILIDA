FROM node:20-slim AS deps
WORKDIR /app

# Install dependencies (including dev) for building the project
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
COPY test ./test
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bring in the compiled sources
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
