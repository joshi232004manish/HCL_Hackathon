/*import { Redis } from "@upstash/redis";

// Provide a graceful in-memory fallback when Upstash credentials are missing.
const hasUpstashCreds =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let redis;

if (hasUpstashCreds) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  (async () => {
    try {
      console.log("Using Upstash Redis");
    } catch (err) {
      console.error("Failed to initialize Upstash Redis", err);
    }
  })();
} else {
  

  console.warn(
    "⚠ UPSTASH_REDIS_REST_URL/TOKEN not set. Using in-memory Redis shim."
  );
}

export { redis };
export default redis;
*/