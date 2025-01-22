#!/bin/bash

# Automatically export all variables from the appropriate env file
set -a
if [ "$NODE_ENV" = "production" ]; then
  source .env.production
  exec node_modules/.bin/next start -p $PORT
else
  source .env.development
  exec node_modules/.bin/next dev -p $PORT
fi
set +a