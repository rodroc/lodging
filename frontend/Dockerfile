FROM node:18.20.8-alpine3.21

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Install a simple HTTP server
RUN npm install -g serve

# Expose port
EXPOSE 80

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "80"]

