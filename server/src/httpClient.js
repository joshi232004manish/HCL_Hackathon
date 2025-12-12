// src/httpClient.js
import axios from 'axios';
import axiosRetry from 'axios-retry';

/**
 * httpClient: axios instance with sensible defaults:
 * - per-request timeout
 * - automatic retries on network errors and 5xx responses
 * - exponential backoff with jitter (axios-retry.exponentialDelay)
 */

const defaultTimeoutMs = parseInt(process.env.HTTP_TIMEOUT_MS || '5000', 10);

const http = axios.create({
  timeout: defaultTimeoutMs,
  headers: { 'User-Agent': 'fault-tolerant-api-example/1.0' }
});

axiosRetry(http, {
  retries: 3,
  // exponentialDelay already approximates jitter; it's good for most use cases.
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // retry on network errors or 5xx responses
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
  shouldResetTimeout: true // resets timeout between retries
});

export default http;
