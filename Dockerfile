# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build with placeholder values - will be replaced at runtime
ENV VITE_SUPABASE_URL=__VITE_SUPABASE_URL__
ENV VITE_SUPABASE_ANON_KEY=__VITE_SUPABASE_ANON_KEY__
ENV VITE_SERPER_API_KEY=__VITE_SERPER_API_KEY__
ENV VITE_GROQ_API_KEY=__VITE_GROQ_API_KEY__

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
