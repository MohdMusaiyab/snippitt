import { Redis } from "@upstash/redis";
import { env } from "./env";

/**
 * Redis Client initialized with Upstash Redis credentials.
 * 
 * To use this, add the following to your .env file:
 * UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
 * UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
 */

const redis = (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (redis) {
  // console.log("Redis Connected Successfully");
} else {
  // console.warn("Redis credentials missing. Redis client not initialized.");
}

export default redis;
