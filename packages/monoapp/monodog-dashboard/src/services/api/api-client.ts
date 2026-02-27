import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HttpMethod,
  ApiRequestConfig,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiInterceptor,
  ApiClientConfig,
} from './types/api.types';
import {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  ServerError,
} from './types/api.types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    retryableStatusCodes: number[];
  };

  constructor(config: Partial<ApiClientConfig> = {}) {
    const baseUrl = config.baseUrl || 'http://localhost:8999';

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: true,
    });

    this.retryConfig = {
      maxRetries: config.retryConfig?.maxRetries || 3,
      backoffMultiplier: config.retryConfig?.backoffMultiplier || 2,
      retryableStatusCodes: config.retryConfig?.retryableStatusCodes || [408, 429, 500, 502, 503, 504],
    };

    this.setupRetryInterceptor();

    if (config.interceptors) {
      for (const interceptor of config.interceptors) {
        this.addInterceptor(interceptor);
      }
    }
  }

  private setupRetryInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config as any;
        if (!config) return Promise.reject(error);

        config.retryCount = config.retryCount || 0;
        const shouldRetry =
          config.retryCount < this.retryConfig.maxRetries &&
          error.response &&
          this.retryConfig.retryableStatusCodes.includes(error.response.status);

        if (shouldRetry) {
          config.retryCount += 1;
          const delay = 1000 * Math.pow(this.retryConfig.backoffMultiplier, config.retryCount - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.axiosInstance(config);
        }

        return Promise.reject(error);
      }
    );
  }

  addInterceptor(interceptor: ApiInterceptor): void {
    this.axiosInstance.interceptors.request.use(
      async config => {
        if (interceptor.onRequest) {
          const apiConfig: ApiRequestConfig = {
            method: config.method?.toUpperCase() as HttpMethod,
            headers: config.headers as Record<string, string>,
            body: config.data,
            timeout: config.timeout,
          };
          const modified = await interceptor.onRequest(apiConfig);
          config.headers = modified.headers || config.headers;
          if (modified.body !== undefined) config.data = modified.body;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      async response => {
        if (interceptor.onResponse) {
          const successResponse: ApiSuccessResponse = {
            success: true,
            data: response.data,
            meta: {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              timestamp: Date.now(),
              duration: 0,
            },
          };
          await interceptor.onResponse(successResponse);
        }
        return response;
      },
      async error => {
        if (interceptor.onError && error.response) {
          const apiError = this.createErrorFromStatus(error.response.status, error.response.statusText);
          await interceptor.onError(apiError);
        }
        return Promise.reject(error);
      }
    );
  }

  private createErrorFromStatus(status: number, statusText: string, body?: unknown): ApiError {
    const message = statusText || `HTTP ${status}`;
    const details = typeof body === 'object' ? (body as Record<string, unknown>) : undefined;

    switch (status) {
      case 400:
        return new ValidationError(message, details);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 408:
        return new TimeoutError(message);
      case 429:
        return new ApiError('RATE_LIMIT', 429, 'Too many requests', details);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status);
      default:
        return new ApiError(`HTTP_${status}`, status, message, details);
    }
  }


  async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    const url = `/api${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await this.axiosInstance.request<T>({
        method: method.toLowerCase() as any,
        url,
        data: config.body,
        headers: config.headers,
        timeout: config.timeout,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response.data,
        meta: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          timestamp: Date.now(),
          duration,
        },
      } as ApiSuccessResponse<T>;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        const statusText = error.response?.statusText || error.message;
        const apiError = this.createErrorFromStatus(status, statusText, error.response?.data);

        console.error(`[${method}] ${url}`, {
          code: apiError.code,
          status: apiError.statusCode,
          message: apiError.message,
        });

        return {
          success: false,
          error: {
            code: apiError.code,
            message: apiError.message,
            status: apiError.statusCode,
            details: apiError.details,
          },
          meta: {
            status,
            statusText,
            headers: error.response?.headers || {},
            timestamp: Date.now(),
            duration,
          },
        } as ApiErrorResponse;
      }

      const unknownError = new ApiError(
        'UNKNOWN_ERROR',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );

      console.error(`[${method}] ${url}`, {
        code: unknownError.code,
        message: unknownError.message,
      });

      return {
        success: false,
        error: {
          code: unknownError.code,
          message: unknownError.message,
          status: unknownError.statusCode,
        },
        meta: {
          timestamp: Date.now(),
          duration,
        },
      } as ApiErrorResponse;
    }
  }

  get<T = unknown>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, config);
  }

  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...config, body });
  }

  put<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...config, body });
  }

  delete<T = unknown>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, config);
  }

  patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...config, body });
  }
}

export default ApiClient;
