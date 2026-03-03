import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  HttpMethod,
  ApiRequestConfig,
  ApiResponse,
  ApiErrorResponse,
} from './types/api.types';
import { cookieUtils } from '../../utils/cookies';

import { DEFAULT_TIMEOUT, DEFAULT_API_BASE_URL } from '../../constants/api-config';
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(config: Partial<{ baseUrl?: string; timeout?: number; headers?: Record<string, string> }> = {}) {
    const baseUrl = config.baseUrl || DEFAULT_API_BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: true,
    });

    this.attachAuthHandling();
  }

  /**
   * Attach request/response handlers responsible for auth token header
   * and clearing cookies on 401 responses.
   */
  private attachAuthHandling(): void {
    this.axiosInstance.interceptors.request.use(config => {
      const token = cookieUtils.get('monodog_session_token');
      if (token) {
        // axios headers type can be AxiosHeaders or plain object, cast to any for mutation
        (config.headers as any) = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          cookieUtils.remove('monodog_session_token');
          cookieUtils.remove('monodog_session_data');
        }
        return Promise.reject(error);
      }
    );
  }

  private mapAxiosError(error: AxiosError): ApiErrorResponse {
    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || error.message;
    const details =
      error.response && typeof error.response.data === 'object' ? error.response.data : undefined;

    let code: string;
    switch (status) {
      case 400:
        code = 'VALIDATION';
        break;
      case 401:
        code = 'UNAUTHORIZED';
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 408:
        code = 'TIMEOUT';
        break;
      case 429:
        code = 'RATE_LIMIT';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = 'SERVER_ERROR';
        break;
      default:
        code = status ? `HTTP_${status}` : 'UNKNOWN';
    }

    console.error(`API error [${status}] ${statusText}`, { code, details });

    return {
      success: false,
      error: { code, message: statusText, status, details: details?.details as Record<string, unknown> | undefined },
      meta: {
        status,
        statusText,
        headers: error.response?.headers || {},
        timestamp: Date.now(),
        duration: 0,
      },
    };
  }

  async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    const url = `/api${endpoint}`;
    const start = Date.now();

    try {
      const response = await this.axiosInstance.request<T>({
        method: method.toLowerCase() as any,
        url,
        data: config.body,
        headers: config.headers,
        timeout: config.timeout,
      });

      const duration = Date.now() - start;

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
      };
    } catch (err) {
      const duration = Date.now() - start;

      if (axios.isAxiosError(err)) {
        return this.mapAxiosError(err);
      }

      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Unexpected error in API client', message);

      return {
        success: false,
        error: { code: 'UNKNOWN', message, status: 0 },
        meta: { timestamp: Date.now(), duration },
      };
    }
  }

  get<T = unknown>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, config || {});
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
    return this.request<T>('DELETE', endpoint, config || {});
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
