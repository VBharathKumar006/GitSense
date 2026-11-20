# Production Dockerfile for GitSense
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci

# Copy built application and source
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
