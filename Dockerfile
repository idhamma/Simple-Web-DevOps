FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all source files
COPY src/ ./

# If package.json doesn't exist, create a basic one
RUN if [ ! -f package.json ]; then \
    echo '{"name": "simple-web-devops", "version": "1.0.0", "main": "index.js", "scripts": {"start": "node index.js"}, "dependencies": {}}' > package.json; \
    fi

# Install dependencies (if any)
RUN npm install

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]