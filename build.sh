#!/bin/bash

echo "🧹 Complete cleanup..."

# Delete namespace (this will delete everything inside)
kubectl delete namespace login-app --ignore-not-found=true

# Wait for namespace deletion
echo "⏳ Waiting for namespace deletion..."
sleep 10

# Remove all docker images
docker rmi $(docker images | grep simple-web-devops | awk '{print $3}') --force 2>/dev/null || true

# Remove from minikube
minikube image rm simple-web-devops:local 2>/dev/null || true

echo "🏗️  Building fresh image..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Build with timestamp
docker build -t simple-web-devops:${TIMESTAMP} . --no-cache

# Tag as local
docker tag simple-web-devops:${TIMESTAMP} simple-web-devops:local

if [ $? -eq 0 ]; then
    echo "✅ New image built: simple-web-devops:${TIMESTAMP}"
    
    # Test locally first
    echo "🧪 Testing nginx locally..."
    docker run --rm -d --name test-nginx -p 8080:80 simple-web-devops:local
    sleep 3
    
    if curl -f http://localhost:8080 >/dev/null 2>&1; then
        echo "✅ Local nginx test passed"
        docker stop test-nginx
    else
        echo "❌ Local nginx test failed"
        docker stop test-nginx
        exit 1
    fi
    
    # Load to minikube
    echo "🚀 Loading to minikube..."
    minikube image load simple-web-devops:local
    
    # Deploy everything fresh
    echo "🚀 Deploying fresh resources..."
    kubectl apply -f k8s/namespace.yaml
    sleep 2
    kubectl apply -f k8s/
    
    echo "✅ Fresh deployment completed"
    
    # Wait for pods to be ready
    echo "⏳ Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod -l app=login-app -n login-app --timeout=60s
    
    # Get service URL
    SERVICE_URL=$(minikube service login-app-service -n login-app --url)
    echo "🌐 Service URL: $SERVICE_URL"
    
    # Test service accessibility
    echo "🧪 Testing service accessibility..."
    sleep 5
    if curl -f $SERVICE_URL >/dev/null 2>&1; then
        echo "✅ Service is accessible!"
        echo "🎉 Website is ready: $SERVICE_URL"
    else
        echo "⚠️  Service test failed, checking configuration..."
        kubectl get svc -n login-app
        kubectl get endpoints -n login-app
    fi
    
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📊 Final status:"
echo "   kubectl get pods -n login-app"
echo "   kubectl get svc -n login-app"
echo "   kubectl get endpoints -n login-app"