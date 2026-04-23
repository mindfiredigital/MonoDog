/**
 * API Types and Interfaces
 * Minimal definitions used throughout the dashboard.
 */

/**
 * HTTP Methods supported by the client helpers
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Configuration passed to individual requests
 */
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Metadata included with every response
 */
export interface ApiResponseMeta {
  status: number;
  statusText: string;
  headers: Record<string, unknown>;
  timestamp: number;
  duration: number;
}

/**
 * Successful API response shape
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
  message?: string;
  // error property always present but undefined for successes
  error?: undefined;
}

/**
 * Error API response shape exposed to callers
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
  };
  meta: Partial<ApiResponseMeta>;
  // data property always present but undefined for errors
  data?: undefined;
}

/**
 * Union type returned by every client helper
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Configuration options for the ApiClient instance
 */
// export interface ApiClientConfig {
//   baseUrl?: string;
//   timeout?: number;
//   headers?: Record<string, string>;
// }
