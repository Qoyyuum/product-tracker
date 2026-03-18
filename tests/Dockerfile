FROM node:22-slim

WORKDIR /tests

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy test files
COPY . .

# Run tests
CMD ["npm", "test"]
