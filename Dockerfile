FROM nginx:alpine

# Copy all files from src to nginx html directory
COPY src/ /usr/share/nginx/html/

# Create a simple index.html if it doesn't exist
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo '<html><head><title>Simple Web DevOps</title></head><body><h1>Welcome to Simple Web DevOps</h1><p>Application is running successfully!</p></body></html>' > /usr/share/nginx/html/index.html; \
    fi

# Expose port 80 (default nginx port)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]