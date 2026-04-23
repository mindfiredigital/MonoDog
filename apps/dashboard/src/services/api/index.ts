/**
 * API Client Instance and Initialization
 * Exports a pre-configured axios wrapper used by dashboard services.
 */

import ApiClient from './api-client';
import { TIMEOUT_MS } from '../../constants/api-config';

/**
 * Determine base URL from env/window or fall back to localhost
 */
function getBaseUrl(): string {
  // Vite injects import.meta.env
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;

  // Fallback for non-Vite setups using process.env
  if (typeof process !== 'undefined' && process.env) {
    const processEnvUrl =
      (process.env as any).REACT_APP_API_URL ||
      (process.env as any).VITE_API_URL;
    if (processEnvUrl) return processEnvUrl;
  }

  const windowUrl = (window as any).ENV?.API_URL;
  if (windowUrl) return windowUrl;

  return 'http://localhost:4000';
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
