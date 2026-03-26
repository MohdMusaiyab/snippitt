import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

// Define a common prefix for all rate limits
const PREFIX = "snipitt:ratelimit";

/**
 * Global Rate Limiter
 * 50 requests per minute across the entire application for a specific action.
 */
export const globalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 m"),
      analytics: true,
      prefix: `${PREFIX}:global`,
    })
  : null;

/**
 * IP-based Rate Limiter
 * 20 requests per minute per IP address.
 */
export const ipRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: `${PREFIX}:ip`,
    })
  : null;

/**
 * Auth Rate Limiter (Signup/Login)
 * 5 signup/login attempts per hour per IP.
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: `${PREFIX}:auth`,
    })
  : null;

/**
 * Login Rate Limiter (Brute force protection)
 * 20 login attempts per minute per IP.
 */
export const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: `${PREFIX}:login`,
    })
  : null;

/**
 * Email Rate Limiter (OTP/Verification/Password Reset)
 * 5 emails per hour per action/target.
 */
export const emailRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: `${PREFIX}:email`,
    })
  : null;

/**
 * Social Rate Limiter (Comments/Likes)
 * 30 actions per minute per IP.
 */
export const socialRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: `${PREFIX}:social`,
    })
  : null;

/**
 * Comprehensive rate limit check for a given identifier.
 */
export async function checkRateLimit(
  actionName: string, 
  identifier: string,
  type: "global" | "auth" | "login" | "email" | "social" = "global"
) {
  if (!redis) {
    console.warn(`⚠️ Rate limiting skipped for ${actionName} because Redis is not configured.`);
    return { success: true };
  }

  let limiter: Ratelimit | null = globalRateLimiter;
  
  switch (type) {
    case "auth": limiter = authRateLimiter; break;
    case "login": limiter = loginRateLimiter; break;
    case "email": limiter = emailRateLimiter; break;
    case "social": limiter = socialRateLimiter; break;
    default: limiter = globalRateLimiter;
  }

  if (!limiter) return { success: true };

  const result = await limiter.limit(`${actionName}:${identifier}`);
  
  if (!result.success) {
    return {
      success: false,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return { 
    success: true,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
