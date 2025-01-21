#!/bin/bash

# Load environment variables
set -a
source .env.production
set +a

# Start Next.js
exec node_modules/.bin/next start -p 3030 