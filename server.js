const next = require('next');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Security headers
  server.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  // Enhanced compression
  server.use(compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Improved rate limiting
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and static assets
      return req.path === '/api/health' || 
             req.path.startsWith('/_next/') ||
             req.path.startsWith('/images/');
    },
  });

  // Apply rate limiting to API routes only
  server.use('/api/', limiter);

  // Static file caching
  server.use('/_next/static/', express.static('.next/static/', {
    maxAge: '1y',
    immutable: true,
  }));

  // Error handling with logging
  server.use((err, req, res, next) => {
    console.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    res.status(500).send('Something broke!');
  });

  // Handle all requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 