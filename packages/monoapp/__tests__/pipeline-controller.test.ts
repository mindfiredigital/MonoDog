
/**
 * Pipeline Controller Tests
 * Exercises the two simple endpoints that relay to the pipeline service.
 */

import { Request, Response } from 'express';
import {
  getRecentPipelines,
  updatePipelineStatus,
} from '../src/controllers/pipeline-controller';
import * as pipelineService from '../src/services/pipeline-service';
import { AppLogger } from '../src/middleware/logger';
import {
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '../src/constants/http';
import {
  AUTH_ERRORS,
  OPERATION_ERRORS,
  VALIDATION_ERRORS,
} from '../src/constants/error-messages';

// mock dependencies
jest.mock('../src/services/pipeline-service');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('Pipeline Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    jest.clearAllMocks();
    responseData = {};

    mockResponse = {
      json: jest.fn((data) => {
        responseData = data;
        return mockResponse;
      }),
      status: jest.fn(function (code) {
        this.statusCode = code;
        return this;
      }),
    };

    mockRequest = {
      user: { id: 1, login: 'user' },
      query: {},
      params: {},
      body: {},
    } as any;
  });

  describe('getRecentPipelines', () => {
    it('returns pipelines when user is authenticated', async () => {
      const pipelines = [{ id: '1' }];
      (pipelineService.getRecentPipelines as jest.Mock).mockResolvedValue(pipelines);

      await getRecentPipelines(mockRequest as Request, mockResponse as Response);

      expect(responseData).toEqual(pipelines);
      expect(pipelineService.getRecentPipelines).toHaveBeenCalledWith(20, 0);
    });

    it('rejects unauthenticated requests', async () => {
      mockRequest.user = undefined;

      await getRecentPipelines(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_UNAUTHORIZED);
      expect(responseData.error).toBe(AUTH_ERRORS.UNAUTHORIZED);
    });

    it('handles service errors gracefully', async () => {
      (pipelineService.getRecentPipelines as jest.Mock).mockRejectedValue(new Error('boom'));

      await getRecentPipelines(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      expect(responseData.error).toBe(OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES);
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });

  describe('updatePipelineStatus', () => {
    it('returns 401 when user is missing', async () => {
      mockRequest.user = undefined;

      await updatePipelineStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_UNAUTHORIZED);
      expect(responseData.error).toBe(AUTH_ERRORS.UNAUTHORIZED);
    });

    it('validates currentStatus field', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { pipelineId: 'abc' } as any;
      mockRequest.body = {} as any;

      await updatePipelineStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
      expect(responseData.error).toBe(VALIDATION_ERRORS.CURRENT_STATUS_REQUIRED);
    });

    it('calls service and returns updated pipeline', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { pipelineId: 'abc' } as any;
      mockRequest.body = { currentStatus: 'completed', currentConclusion: 'success' } as any;

      const updated = { id: 'abc', currentStatus: 'completed' };
      (pipelineService.updatePipelineStatus as jest.Mock).mockResolvedValue(updated);

      await updatePipelineStatus(mockRequest as Request, mockResponse as Response);

      expect(responseData.success).toBe(true);
      expect(responseData.pipeline).toEqual(updated);
      expect(pipelineService.updatePipelineStatus).toHaveBeenCalledWith(
        'abc',
        'completed',
        'success',
        undefined
      );
    });

    it('handles service failure', async () => {
      mockRequest.user = { id: 1 } as any;
      mockRequest.params = { pipelineId: 'abc' } as any;
      mockRequest.body = { currentStatus: 'in_progress' } as any;

      (pipelineService.updatePipelineStatus as jest.Mock).mockRejectedValue(new Error('fail'));

      await updatePipelineStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      expect(responseData.error).toBe(OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES);
      expect(AppLogger.error).toHaveBeenCalled();
    });
  });
});
