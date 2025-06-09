#!/bin/bash

# Build script for Simple Web DevOps application

echo "Building local Docker image..."

# Build the Docker image
docker build -t simple-web-devops:local .

if [ $? -eq 0 ]; then
    echo "✅ Image built successfully: simple-web-devops:local"
    echo "📋 Available images:"
    docker images | grep simple-web-devops
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 To deploy to Kubernetes, run:"
echo "   kubectl apply -f k8s/"