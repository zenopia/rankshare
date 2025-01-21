#!/bin/bash

# Automatically export all variables from the appropriate env file
set -a
if [ "$NODE_ENV" = "production" ]; then
  source .env.production
else
  source .env.development
fi
set +a

# Start Next.js with the specified port from PM2 environment
exec node_modules/.bin/next start -p $PORT 