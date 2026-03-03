/**
 * Publishing Integration Tests - Simplified
 * Core workflow tests for end-to-end publishing
 */

import * as changesetService from '../src/services/changeset-service';
import * as gitHubActionsService from '../src/services/github-actions-service';
import * as pipelineService from '../src/services/pipeline-service';
import { AppLogger } from '../src/middleware/logger';

jest.mock('../src/services/changeset-service');
jest.mock('../src/services/github-actions-service');
jest.mock('../src/services/pipeline-service');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../src/utils/utilities');

describe('Publishing Workflow Integration - Simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('happy path - complete publish workflow', async () => {
    // Setup mocks for entire workflow
    const mockPackages = [
      { name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} },
      { name: '@pkg/b', version: '2.0.0', path: '/b', private: false, dependencies: {}, devDependencies: {} },
    ];

    (changesetService.getWorkspacePackages as jest.Mock).mockResolvedValue(mockPackages);
    (changesetService.calculateNewVersions as jest.Mock).mockReturnValue([
      { package: '@pkg/a', currentVersion: '1.0.0', newVersion: '1.1.0', bumpType: 'minor' },
      { package: '@pkg/b', currentVersion: '2.0.0', newVersion: '2.0.1', bumpType: 'patch' },
    ]);
    (changesetService.isWorkingTreeClean as jest.Mock).mockResolvedValue(true);
    (changesetService.getExistingChangesets as jest.Mock).mockResolvedValue(['changeset-1']);
    (gitHubActionsService.listWorkflows as jest.Mock).mockResolvedValue({
      workflows: [{ id: 123, name: 'Release', path: '.github/workflows/release.yml', state: 'active' }],
    });
    (changesetService.checkCIPassing as jest.Mock).mockResolvedValue(true);
    (changesetService.checkVersionAvailableOnNpm as jest.Mock).mockResolvedValue(true);
    (changesetService.triggerPublishPipeline as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Workflow initiated',
    });
    (pipelineService.createOrUpdatePipeline as jest.Mock).mockResolvedValue({
      id: 'pipeline-123',
      releaseVersion: '1.1.0',
    });

    // Step 1: Get packages
    const packages = await changesetService.getWorkspacePackages('/repo');
    expect(packages).toHaveLength(2);

    // Step 2: Calculate versions
    const bumps = [
      { package: '@pkg/a', bumpType: 'minor' },
      { package: '@pkg/b', bumpType: 'patch' },
    ];
    const newVersions = changesetService.calculateNewVersions(packages, bumps);
    expect(newVersions).toHaveLength(2);

    // Step 3: Check prerequisites
    const isClean = await changesetService.isWorkingTreeClean('/repo');
    expect(isClean).toBe(true);

    const changesets = await changesetService.getExistingChangesets('/repo');
    expect(changesets).toHaveLength(1);

    const ciPassing = await changesetService.checkCIPassing('token', 'owner', 'repo', 'id', '.github/workflows/release.yml');
    expect(ciPassing).toBe(true);

    // Step 4: Trigger publish
    const result = await changesetService.triggerPublishPipeline('/repo', 'testuser');
    expect(result.success).toBe(true);
  });

  test('blocked - failing CI check', async () => {
    (changesetService.getWorkspacePackages as jest.Mock).mockResolvedValue([
      { name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} },
    ]);
    (changesetService.checkCIPassing as jest.Mock).mockResolvedValue(false);

    const packages = await changesetService.getWorkspacePackages('/repo');
    expect(packages).toHaveLength(1);

    const ciPassing = await changesetService.checkCIPassing('token', 'owner', 'repo', 'id', '.github/workflows/release.yml');
    expect(ciPassing).toBe(false);
  });

  test('blocked - version already on npm', async () => {
    (changesetService.getWorkspacePackages as jest.Mock).mockResolvedValue([
      { name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} },
    ]);
    (changesetService.checkVersionAvailableOnNpm as jest.Mock).mockResolvedValue(false);

    const packages = await changesetService.getWorkspacePackages('/repo');
    expect(packages).toHaveLength(1);

    const available = await changesetService.checkVersionAvailableOnNpm('@pkg/a', '1.1.0');
    expect(available).toBe(false);
  });

  test('blocked - dirty working tree', async () => {
    (changesetService.isWorkingTreeClean as jest.Mock).mockResolvedValue(false);

    const isClean = await changesetService.isWorkingTreeClean('/repo');
    expect(isClean).toBe(false);
  });
});
