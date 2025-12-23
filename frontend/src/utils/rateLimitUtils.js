// src/utils/rateLimitUtils.js

/**
 * Simple client-side rate limiter
 * Tracks requests and prevents spam
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  _filterWindow() {
    const now = Date.now();
    this.requests = this.requests.filter(ts => now - ts < this.windowMs);
  }

  /**
   * Check if request should be allowed
   */
    canMakeRequest() {
    const now = Date.now();
    this._filterWindow();
    if (this.requests.length >= this.maxRequests) {
      console.log(`[RateLimiter] Rate limit exceeded. Requests: ${this.requests.length}, Max: ${this.maxRequests}`);
      return false;
    }
    this.requests.push(now);
    console.log(`[RateLimiter] Request allowed. New count: ${this.requests.length}`);
    return true;
  }

  getRemainingRequests() {
    this._filterWindow();
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getRetryAfter() {
    this._filterWindow();
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, Math.ceil(timeUntilReset / 1000));
  }

  reset() { this.requests = []; }
}

// Create rate limiters for different operations
export const metadataRateLimiter = new RateLimiter(10, 60000); // 10 per minute
export const stripRateLimiter = new RateLimiter(5, 60000); // 5 per minute (more expensive operation)

/**
 * Check if operation is rate limited
 */
export const checkRateLimit = (limiter, operationName) => {
  if (!limiter.canMakeRequest()) {
    const retryAfter = limiter.getRetryAfter();
    throw new Error(
      `Too many ${operationName} requests. Please wait ${retryAfter} seconds before trying again.`
    );
  }
};