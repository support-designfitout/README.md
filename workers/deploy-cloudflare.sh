#!/usr/bin/env bash
# Deploy script for Cloudflare Workers
# This script helps deploy both edge-cache and api-gateway workers
#
# Usage: ./deploy-cloudflare.sh [edge-cache|api-gateway|all]

set -e

WORKER=$1

if [ -z "$WORKER" ]; then
  echo "Usage: $0 [edge-cache|api-gateway|all]"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo -e "${RED}Error: Wrangler CLI is not installed${NC}"
  echo "Install it with: npm install -g wrangler"
  exit 1
fi

# Function to deploy a worker
deploy_worker() {
  local worker_name=$1
  local worker_dir="workers/$worker_name"
  
  echo -e "${YELLOW}Deploying $worker_name...${NC}"
  
  # Check if directory exists
  if [ ! -d "$worker_dir" ]; then
    echo -e "${RED}Error: Worker directory $worker_dir not found${NC}"
    exit 1
  fi
  
  # Check if wrangler.toml exists
  if [ ! -f "$worker_dir/wrangler.toml" ]; then
    echo -e "${YELLOW}wrangler.toml not found. Creating from template...${NC}"
    
    if [ -f "$worker_dir/wrangler.toml.template" ]; then
      cp "$worker_dir/wrangler.toml.template" "$worker_dir/wrangler.toml"
      echo -e "${YELLOW}Please edit $worker_dir/wrangler.toml with your account details${NC}"
      echo -e "${YELLOW}Then run this script again${NC}"
      exit 1
    else
      echo -e "${RED}Error: Template not found${NC}"
      exit 1
    fi
  fi
  
  # Deploy
  cd "$worker_dir"
  wrangler deploy
  cd ../..
  
  echo -e "${GREEN}✓ $worker_name deployed successfully${NC}"
}

# Main deployment logic
case $WORKER in
  edge-cache)
    deploy_worker "edge-cache"
    ;;
  api-gateway)
    deploy_worker "api-gateway"
    ;;
  all)
    deploy_worker "edge-cache"
    deploy_worker "api-gateway"
    ;;
  *)
    echo -e "${RED}Error: Unknown worker '$WORKER'${NC}"
    echo "Valid options: edge-cache, api-gateway, all"
    exit 1
    ;;
esac

echo -e "${GREEN}Deployment complete!${NC}"
