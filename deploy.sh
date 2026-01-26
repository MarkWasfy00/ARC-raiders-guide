#!/bin/bash
# Zero-downtime deployment script for ARC Raiders Guide
# Usage: ./deploy.sh [full]
#   - No args: Rolling update of app1 and app2 only
#   - "full": Full rebuild including all services

set -e

echo "=========================================="
echo "  ARC Raiders Guide - Deployment Script"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ "$1" == "full" ]; then
    echo -e "${YELLOW}Full rebuild requested...${NC}"

    # Remove old nginx cache volume if exists
    echo "Removing old nginx cache volume..."
    docker volume rm arcraiders-guide_nginx_cache 2>/dev/null || true

    echo "Building and starting all services..."
    docker compose up -d --build

    echo -e "${GREEN}Full deployment complete!${NC}"
else
    echo "Rolling update (zero-downtime)..."

    # Build new images
    echo "Building new images..."
    docker compose build app1 app2

    # Update app1 first (app2 continues serving traffic)
    echo -e "${YELLOW}Updating app1...${NC}"
    docker compose up -d --no-deps app1

    # Wait for app1 to be healthy
    echo "Waiting for app1 health check..."
    sleep 15

    # Check if app1 is healthy
    if docker compose ps app1 | grep -q "healthy"; then
        echo -e "${GREEN}app1 is healthy${NC}"
    else
        echo -e "${YELLOW}Warning: app1 health status uncertain, continuing...${NC}"
    fi

    # Update app2 (app1 now serving traffic)
    echo -e "${YELLOW}Updating app2...${NC}"
    docker compose up -d --no-deps app2

    # Wait for app2 to be healthy
    echo "Waiting for app2 health check..."
    sleep 15

    # Restart nginx to clear cache
    echo "Restarting nginx to clear cache..."
    docker compose restart nginx

    echo -e "${GREEN}Rolling deployment complete!${NC}"
fi

# Show status
echo ""
echo "Current container status:"
docker compose ps

# Show resource usage
echo ""
echo "Resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
