/**
 * API Client Instance and Initialization
 * Creates and exports a pre-configured axios API client with interceptors
 */

import ApiClient from './api-client';
import type { ApiInterceptor } from './types/api.types';
import { cookieUtils } from '../../utils/cookies';
import { TIMEOUT_MS } from '../../constants/api-config';
/**
 * Get base URL from environment or window config
 */
function getBaseUrl(): string {
  const envUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const windowUrl = (window as any).ENV?.API_URL;
  if (windowUrl) return windowUrl;

  return 'http://localhost:8999';
}

/**
 * Auth token interceptor - adds authorization header to requests
 */
const authInterceptor: ApiInterceptor = {
  onRequest: async (config) => {
    const token = cookieUtils.get('monodog_session_token');

    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return config;
  },

  onError: async (error) => {
    // Handle token expiration
    if (error.statusCode === 401) {
      cookieUtils.remove('monodog_session_token');
      cookieUtils.remove('monodog_session_data');
    }

    return error;
  },
};

const apiClient = new ApiClient({
  baseUrl: getBaseUrl(),
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  interceptors: [authInterceptor],
  retryConfig: {
    maxRetries: 3,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    backoffMultiplier: 2,
  },
});

export default apiClient;
export { ApiClient };
