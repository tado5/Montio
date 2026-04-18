import { RATE_LIMITING } from '../config/constants.js';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based solution
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  check(identifier, windowMs, maxRequests) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (this.requests.size > 10000) {
      this.cleanup(windowMs);
    }

    return {
      allowed: true,
      remaining: maxRequests - recentRequests.length,
      resetTime: Math.ceil(windowMs / 1000)
    };
  }

  cleanup(windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(t => t > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

const limiter = new RateLimiter();

/**
 * Rate limiting middleware for login endpoint
 */
export const loginRateLimiter = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress || 'unknown';
  const { WINDOW_MS, MAX_REQUESTS, MESSAGE } = RATE_LIMITING.LOGIN;

  const result = limiter.check(`login:${identifier}`, WINDOW_MS, MAX_REQUESTS);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetTime);

  if (!result.allowed) {
    return res.status(429).json({
      message: MESSAGE,
      retryAfter: result.resetTime
    });
  }

  next();
};

/**
 * General API rate limiter
 */
export const apiRateLimiter = (req, res, next) => {
  const identifier = req.user?.id || req.ip || 'anonymous';
  const { WINDOW_MS, MAX_REQUESTS } = RATE_LIMITING.API;

  const result = limiter.check(`api:${identifier}`, WINDOW_MS, MAX_REQUESTS);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetTime);

  if (!result.allowed) {
    return res.status(429).json({
      message: 'Príliš veľa requestov. Skúste znova o chvíľu.',
      retryAfter: result.resetTime
    });
  }

  next();
};
