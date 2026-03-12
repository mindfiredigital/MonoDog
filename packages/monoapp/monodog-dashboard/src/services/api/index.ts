/**
 * API Client Instance and Initialization
 */

import ApiClient from './api-client';
import { TIMEOUT_MS, DEFAULT_API_BASE_URL } from '../../constants/api-config';

/**
 * Determine base URL from env/window or fall back to localhost
 */
function getBaseUrl(): string {
  const envUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const windowUrl = (window as any).ENV?.API_URL;
  if (windowUrl) return windowUrl;

  return DEFAULT_API_BASE_URL;
}

const apiClient = new ApiClient({
  baseUrl: getBaseUrl(),
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
export { ApiClient };
