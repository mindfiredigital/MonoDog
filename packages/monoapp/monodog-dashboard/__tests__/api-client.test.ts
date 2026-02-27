/**
 * API Client Tests
 * Tests for ApiClient class: request handling, error handling, retries, interceptors
 */

import axios from 'axios';
import ApiClient from '../src/services/api/api-client';
import {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  ServerError,
} from '../src/services/api/types/api.types';

// Mock axios
jest.mock('axios');

describe('ApiClient', () => {
  let mockAxiosInstance: any;
  let apiClient: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.create
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    (axios.isAxiosError as jest.Mock).mockImplementation(error => error && error.response);

    apiClient = new ApiClient({ baseUrl: 'http://localhost:8999' });
  });

  describe('Constructor and Configuration', () => {
    it('should create instance with default config', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8999',
          timeout: 30000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          withCredentials: true,
        })
      );
    });

    it('should create instance with custom config', () => {
      jest.clearAllMocks();
      mockAxiosInstance = {
        request: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };
      (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

      const customClient = new ApiClient({
        baseUrl: 'http://api.example.com',
        timeout: 60000,
        headers: { Authorization: 'Bearer token' },
      });

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://api.example.com',
          timeout: 60000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          }),
        })
      );
    });

    it('should setup retry interceptor on creation', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('GET Request', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/api/test',
        })
      );
    });

    it('should include request config in GET request', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.get('/test', {
        headers: { 'X-Custom': 'value' },
        timeout: 5000,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          headers: { 'X-Custom': 'value' },
          timeout: 5000,
        })
      );
    });
  });

  describe('POST Request', () => {
    it('should make successful POST request with body', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Created' },
        status: 201,
        statusText: 'Created',
        headers: {},
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await apiClient.post('/test', { name: 'Test' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Created' });
      expect(result.meta?.status).toBe(201);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/api/test',
          data: { name: 'Test' },
        })
      );
    });

    it('should post without body', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.post('/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/api/test',
          data: undefined,
        })
      );
    });
  });

  describe('PUT Request', () => {
    it('should make successful PUT request', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { id: 1, name: 'Updated' },
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await apiClient.put('/test/1', { name: 'Updated' });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/api/test/1',
          data: { name: 'Updated' },
        })
      );
    });
  });

  describe('DELETE Request', () => {
    it('should make successful DELETE request', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await apiClient.delete('/test/1');

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
          url: '/api/test/1',
        })
      );
    });
  });

  describe('PATCH Request', () => {
    it('should make successful PATCH request', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { id: 1, status: 'active' },
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await apiClient.patch('/test/1', { status: 'active' });

      expect(result.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'patch',
          url: '/api/test/1',
          data: { status: 'active' },
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 validation error', async () => {
      const error = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { error: 'Invalid input' },
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/VALIDATION/i);
      expect(result.error?.status).toBe(400);
    });

    it('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/UNAUTHORIZED/i);
      expect(result.error?.status).toBe(401);
    });

    it('should handle 403 forbidden error', async () => {
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/FORBIDDEN/i);
      expect(result.error?.status).toBe(403);
    });

    it('should handle 404 not found error', async () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/NOT_FOUND/i);
      expect(result.error?.status).toBe(404);
    });

    it('should handle 408 timeout error', async () => {
      const error = {
        response: {
          status: 408,
          statusText: 'Request Timeout',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/TIMEOUT/i);
      expect(result.error?.status).toBe(408);
    });

    it('should handle 429 rate limit error', async () => {
      const error = {
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/RATE_LIMIT/i);
      expect(result.error?.status).toBe(429);
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
        },
        config: {},
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/SERVER/i);
      expect(result.error?.status).toBe(500);
    });

    it('should handle unknown non-axios errors', async () => {
      const error = new Error('Network error');
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      mockAxiosInstance.request.mockRejectedValue(error);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error?.code).toMatch(/UNKNOWN/i);
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('Response Metadata', () => {
    it('should include timestamp and duration in response', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { test: true },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      });

      const result = await apiClient.get('/test');

      expect(result.meta).toBeDefined();
      expect(result.meta?.status).toBe(200);
      expect(result.meta?.statusText).toBe('OK');
      expect(result.meta?.timestamp).toBeDefined();
      expect(result.meta?.duration).toBeDefined();
      expect(typeof result.meta?.duration).toBe('number');
    });

    it('should include headers in response metadata', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: { 'x-custom': 'value' },
      });

      const result = await apiClient.get('/test');

      expect(result.meta?.headers).toEqual(expect.objectContaining({ 'x-custom': 'value' }));
    });
  });

  describe('Interceptors', () => {
    it('should add custom interceptor', () => {
      const mockInterceptor = {
        onRequest: jest.fn(async config => config),
        onResponse: jest.fn(),
        onError: jest.fn(),
      };

      apiClient.addInterceptor(mockInterceptor);

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Endpoint Path Construction', () => {
    it('should prepend /api to all endpoint paths', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.get('/packages');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/api/packages' })
      );

      jest.clearAllMocks();
      mockAxiosInstance.request.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.get('/auth/login');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/api/auth/login' })
      );
    });
  });
});
