#!/bin/bash
# Quick deployment script for OpenSign platform
# This script helps you deploy the platform with minimal steps

set -e

echo "🚀 OpenSign Platform Deployment Script"
echo "======================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual credentials:"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - SENDGRID_API_KEY"
    echo "   - SENDGRID_FROM_EMAIL"
    echo "   - DO_SPACES_ENDPOINT"
    echo "   - DO_SPACES_KEY"
    echo "   - DO_SPACES_SECRET"
    echo "   - DO_SPACES_BUCKET"
    echo ""
    echo "Press Enter after editing .env to continue, or Ctrl+C to exit..."
    read
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building and starting containers..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if containers are running
if docker ps | grep -q "opensign-backend"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start. Check logs with: docker logs opensign-backend"
fi

if docker ps | grep -q "opensign-frontend"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start. Check logs with: docker logs opensign-frontend"
fi

if docker ps | grep -q "opensign-mongodb"; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB failed to start. Check logs with: docker logs opensign-mongodb"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:5000"
echo "   Health check: http://localhost:5000/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
