FROM node:18.20.8-alpine3.21

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Wait for database and start server
CMD ["sh", "-c", "sleep 10 && npm run migrate && npm run seed && npm start"]

