import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getHealth,
  getPackageHealth,
} from '../../src/controllers/health.controller';
import * as healthService from '../../src/services/health.service';
import { Request, Response } from 'express';

vi.mock('../../src/services/health.service', () => ({
  getSystemHealth: vi.fn(),
  getPackageHealthMetrics: vi.fn(),
  getAllPackagesHealthMetrics: vi.fn(),
  refreshPackagesHealth: vi.fn(),
}));

describe('Health Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const jsonSpy = vi.fn();
  const statusSpy = vi.fn().mockReturnThis();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      json: jsonSpy,
      status: statusSpy,
    };
  });

  describe('getHealth', () => {
    it('should return 200 and system health', () => {
      const mockHealth = {
        status: 'ok',
        timestamp: 123,
        version: '1.0.0',
        services: {},
      };
      vi.mocked(healthService.getSystemHealth).mockReturnValue(
        mockHealth as any
      );

      getHealth(mockRequest as Request, mockResponse as Response);

      expect(jsonSpy).toHaveBeenCalledWith(mockHealth);
    });

    it('should return 500 if service throws', () => {
      vi.mocked(healthService.getSystemHealth).mockImplementation(() => {
        throw new Error('Service error');
      });

      getHealth(mockRequest as Request, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Failed to fetch health status',
      });
    });
  });

  describe('getPackageHealth', () => {
    it('should return package health metrics', async () => {
      mockRequest.params = { name: 'test-pkg' };
      const mockMetrics = { packageName: 'test-pkg', health: {} };
      vi.mocked(healthService.getPackageHealthMetrics).mockResolvedValue(
        mockMetrics as any
      );

      await getPackageHealth(mockRequest as Request, mockResponse as Response);

      expect(jsonSpy).toHaveBeenCalledWith(mockMetrics);
    });

    it('should return 404 if package not found', async () => {
      mockRequest.params = { name: 'unknown' };
      vi.mocked(healthService.getPackageHealthMetrics).mockRejectedValue(
        new Error('Package not found')
      );

      await getPackageHealth(mockRequest as Request, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Package not found' });
    });
  });
});
