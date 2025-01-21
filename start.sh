#!/bin/bash

# Automatically export all variables from .env.production
set -a
source .env.development
set +a

# Start Next.js with the specified port
exec node_modules/.bin/next start -p 3001 