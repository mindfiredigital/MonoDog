/**
 * API Types and Interfaces
 * Centralized type definitions for API operations
 */

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * API Request Configuration
 */
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * API Response Metadata
 */
export interface ApiResponseMeta {
  status: number;
  statusText: string;
  headers: Headers;
  timestamp: number;
  duration: number;
}

/**
 * Successful API Response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
  message?: string;
}

/**
 * Error API Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    status: number;
  };
  meta: Partial<ApiResponseMeta>;
}

/**
 * Unified API Response Type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * API Error Classes
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super('NETWORK_ERROR', 0, message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string) {
    super('TIMEOUT_ERROR', 408, message);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super('UNAUTHORIZED', 401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super('FORBIDDEN', 403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super('NOT_FOUND', 404, message);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string, statusCode: number = 500) {
    super('SERVER_ERROR', statusCode, message);
    this.name = 'ServerError';
  }
}

/**
 * API Interceptor Hooks
 */
export interface ApiInterceptor {
  onRequest?(config: ApiRequestConfig): Promise<ApiRequestConfig>;
  onResponse?<T>(response: ApiSuccessResponse<T>): Promise<ApiSuccessResponse<T>>;
  onError?(error: ApiError): Promise<ApiError>;
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  interceptors?: ApiInterceptor[];
  retryConfig?: {
    maxRetries: number;
    retryableStatusCodes: number[];
    backoffMultiplier: number;
  };
}
