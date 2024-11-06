#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Install dependencies
npm install

# Build the application
npm run build

# Start PM2 process
npm run deploy

echo "Deployment completed successfully!" 