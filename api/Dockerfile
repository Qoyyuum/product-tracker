FROM node:22-slim

WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# !! IMPORTANT: Set this environment variable to prevent wrangler dev from hanging !!
ENV WRANGLER_SEND_METRICS=false

# Expose port
EXPOSE 8787

# Start development server
CMD ["npm", "run", "start"]
