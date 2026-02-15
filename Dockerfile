# Dockerfile for Discord Bot
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory if it doesn't exist
RUN mkdir -p data

# Expose port (optional, for health checks)
EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
