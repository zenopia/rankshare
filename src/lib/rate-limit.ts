import { headers } from 'next/headers';
import { ApiError } from './api-utils';

interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
}

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

function cleanup() {
  const now = Date.now();
  Array.from(rateLimitStore.keys()).forEach(key => {
    const entry = rateLimitStore.get(key);
    if (entry && now - entry.lastCleanup > CLEANUP_INTERVAL) {
      rateLimitStore.delete(key);
    }
  });
}

export async function rateLimit(key: string, config: RateLimitConfig) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'anonymous';
  const identifier = `${key}:${ip}`;
  
  const now = Date.now();
  const windowMs = config.window * 1000;
  const windowStart = now - windowMs;

  // Clean up old entries if needed
  cleanup();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(timestamp => timestamp > windowStart);

  // Add current request timestamp
  entry.timestamps.push(now);

  // Update last cleanup time
  entry.lastCleanup = now;

  // Check if limit is exceeded
  if (entry.timestamps.length > config.limit) {
    throw new ApiError(
      'Too many requests. Please try again later.',
      429
    );
  }
} 