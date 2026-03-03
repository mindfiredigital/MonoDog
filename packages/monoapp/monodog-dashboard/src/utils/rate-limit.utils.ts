/**
 * Rate Limit Utilities
 * Helper functions for handling GitHub API rate limit information
 */

import type { RateLimitInfo } from '../services/api/types/api.types';
import { DASHBOARD_RATE_LIMIT_MESSAGES } from '../constants/messages';

/**
 * Check if rate limit is exhausted
 */
export const isRateLimitExhausted = (rateLimit?: RateLimitInfo): boolean => {
  return rateLimit ? rateLimit.remaining === 0 : false;
};

/**
 * Check if approaching rate limit (less than 10% remaining)
 */
export const isApproachingRateLimit = (rateLimit?: RateLimitInfo): boolean => {
  if (!rateLimit) return false;
  const threshold = rateLimit.limit * 0.1; // 10% of limit
  return rateLimit.remaining > 0 && rateLimit.remaining <= threshold;
};

/**
 * Format Unix timestamp to readable date/time
 */
export const formatResetTime = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) {
    return 'now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get rate limit error message
 */
export const getRateLimitErrorMessage = (rateLimit?: RateLimitInfo): string => {
  if (!rateLimit || rateLimit.remaining > 0) {
    return '';
  }

  const resetTime = formatResetTime(rateLimit.reset);
  return DASHBOARD_RATE_LIMIT_MESSAGES.QUOTA_RESET(resetTime);
};

/**
 * Get rate limit warning message (for approaching limit)
 */
export const getRateLimitWarningMessage = (rateLimit?: RateLimitInfo): string => {
  if (!rateLimit || !isApproachingRateLimit(rateLimit)) {
    return '';
  }

  return DASHBOARD_RATE_LIMIT_MESSAGES.APPROACHING_LIMIT(rateLimit.remaining, rateLimit.limit);
};
