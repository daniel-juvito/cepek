# Stage 1: Building the application
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build Next.js and compile custom server
RUN npm run build

# Stage 2: Production environment
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
