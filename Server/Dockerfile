FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install native deps needed for bcrypt, sharp, sqlite
RUN apk add --no-cache python3 make g++ bash sqlite-dev

# Copy package files and install all deps (needed for build)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Remove devDependencies to shrink image
RUN npm prune --production

# Expose port
EXPOSE 8081
ENV NODE_ENV=production

# Start compiled JS
CMD ["npm", "run", "start"]
