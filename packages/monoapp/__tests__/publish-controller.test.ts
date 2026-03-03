/**
 * Publish Controller Tests - Simplified
 * Tests HTTP endpoints for publishing workflow
 */

import { Request, Response } from 'express';
import {
  previewPublish,
  createChangeset,
  triggerPublish
} from '../src/controllers/publish-controller';
import * as changesetService from '../src/services/changeset-service';
import * as gitHubActionsService from '../src/services/github-actions-service';
import { getRepositoryInfoFromGit } from '../src/utils/utilities';

jest.mock('../src/services/changeset-service');
jest.mock('../src/services/pipeline-service');
jest.mock('../src/services/github-actions-service');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../src/utils/utilities');

describe('Publish Controller - Simplified', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    jest.clearAllMocks();
    responseData = {};
    mockResponse = {
      json: jest.fn((data) => { responseData = data; return mockResponse; }),
      status: jest.fn(function (code) { this.statusCode = code; return this; }),
    };
    mockRequest = {
      app: { locals: { rootPath: '/repo' } } as any,
      user: { id: 1, login: 'testuser', avatar_url: 'https://...' },
      accessToken: 'token',
      permission: { permission: 'write' },
      body: {},
    };
  });

  test('previewPublish - returns valid preview', async () => {
    mockRequest.body = {
      packages: ['@pkg/a'],
      bumps: [{ package: '@pkg/a', bumpType: 'minor' }],
    };

    (changesetService.getWorkspacePackages as jest.Mock).mockResolvedValue([
      { name: '@pkg/a', version: '1.0.0', path: '/path', private: false, dependencies: {}, devDependencies: {} },
    ]);
    (changesetService.calculateNewVersions as jest.Mock).mockReturnValue([
      { package: '@pkg/a', currentVersion: '1.0.0', newVersion: '1.1.0', bumpType: 'minor' },
    ]);
    (changesetService.isWorkingTreeClean as jest.Mock).mockResolvedValue(true);
    (changesetService.getExistingChangesets as jest.Mock).mockResolvedValue([]);
    (changesetService.checkCIPassing as jest.Mock).mockResolvedValue(true);
    (changesetService.checkVersionAvailableOnNpm as jest.Mock).mockResolvedValue(true);
    (getRepositoryInfoFromGit as jest.Mock).mockResolvedValue({ owner: 'owner', repo: 'repo' });
    (gitHubActionsService.listWorkflows as jest.Mock).mockResolvedValue({
      workflows: [{ id: 1, name: 'Release', path: '.github/workflows/release.yml', state: 'active' }],
    });

    await previewPublish(mockRequest as Request, mockResponse as Response);

    expect(responseData.success).toBe(true);
    expect(responseData.isValid).toBe(true);
  });

  test('previewPublish - insufficient permissions', async () => {
    (mockRequest as any).permission = { permission: 'read' };
    mockRequest.body = {
      packages: ['@pkg/a'],
      bumps: [{ package: '@pkg/a', bumpType: 'minor' }],
    };

    (changesetService.getWorkspacePackages as jest.Mock).mockResolvedValue([
      { name: '@pkg/a', version: '1.0.0', path: '/path', private: false, dependencies: {}, devDependencies: {} },
    ]);
    (changesetService.calculateNewVersions as jest.Mock).mockReturnValue([
      { package: '@pkg/a', currentVersion: '1.0.0', newVersion: '1.1.0', bumpType: 'minor' },
    ]);
    (changesetService.isWorkingTreeClean as jest.Mock).mockResolvedValue(true);
    (changesetService.getExistingChangesets as jest.Mock).mockResolvedValue([]);
    (changesetService.checkCIPassing as jest.Mock).mockResolvedValue(true);
    (changesetService.checkVersionAvailableOnNpm as jest.Mock).mockResolvedValue(true);
    (getRepositoryInfoFromGit as jest.Mock).mockResolvedValue({ owner: 'owner', repo: 'repo' });
    (gitHubActionsService.listWorkflows as jest.Mock).mockResolvedValue({
      workflows: [{ id: 1, name: 'Release', path: '.github/workflows/release.yml', state: 'active' }],
    });

    await previewPublish(mockRequest as Request, mockResponse as Response);

    expect(responseData.success).toBe(true);
    expect(responseData.isValid).toBe(false);
    expect(responseData.errors.length).toBeGreaterThan(0);
    expect(responseData.checks.permissions).toBe(false);
  });

  test('createChangeset - success', async () => {
    mockRequest.body = {
      packages: ['@pkg/a'],
      bumps: [{ package: '@pkg/a', bumpType: 'minor' }],
      summary: 'This is a valid changelog summary',
    };

    (changesetService.generateChangeset as jest.Mock).mockResolvedValue({
      success: true,
      changeset: 'my-changeset-123',
    });

    await createChangeset(mockRequest as Request, mockResponse as Response);

    expect(responseData.success).toBe(true);
    expect(responseData.changeset).toBe('my-changeset-123');
  });

  test('createChangeset - invalid summary', async () => {
    mockRequest.body = {
      packages: ['@pkg/a'],
      bumps: [],
      summary: 'short',
    };

    await createChangeset(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  test('triggerPublish - success', async () => {
    (mockRequest as any).permission = { permission: 'maintain' };
    mockRequest.body = { packages: [{ name: '@pkg/a' }] };

    (changesetService.isWorkingTreeClean as jest.Mock).mockResolvedValue(true);
    (changesetService.getExistingChangesets as jest.Mock).mockResolvedValue(['changeset-1']);
    (changesetService.triggerPublishPipeline as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Workflow initiated',
    });

    await triggerPublish(mockRequest as Request, mockResponse as Response);

    expect(responseData.success).toBe(true);
  });

  test('triggerPublish - missing permissions', async () => {
    (mockRequest as any).permission = { permission: 'write' };

    await triggerPublish(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });
});
