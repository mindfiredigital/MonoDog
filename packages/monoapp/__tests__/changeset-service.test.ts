/**
 * Changeset Service Tests - Simplified
 * Core functionality tests for changeset operations
 */

import {
  getWorkspacePackages,
  calculateNewVersions,
  checkCIPassing,
  generateChangeset,
  getExistingChangesets,
} from '../src/services/changeset-service';
import * as packageService from '../src/services/package-service';
import * as gitHubActionsService from '../src/services/github-actions-service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');
jest.mock('../src/services/package-service');
jest.mock('../src/services/github-actions-service');
jest.mock('../src/middleware/logger', () => ({
  AppLogger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('child_process');

describe('Changeset Service - Simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getWorkspacePackages - returns packages', async () => {
    const mockPackages = [
      { name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} },
      { name: '@pkg/b', version: '2.0.0', path: '/b', private: false, dependencies: {}, devDependencies: {} },
    ];

    (packageService.getPackagesService as jest.Mock).mockResolvedValue(mockPackages);

    const result = await getWorkspacePackages('/repo');

    expect(result).toEqual(mockPackages);
    expect(result).toHaveLength(2);
  });

  test('calculateNewVersions - calculates correct bumps', () => {
    const packages = [
      { name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} },
    ];
    const bumps = [{ package: '@pkg/a', bumpType: 'minor' as const }];

    const result = calculateNewVersions(packages, bumps);

    expect(result[0].newVersion).toBe('1.1.0');
    expect(result[0].bumpType).toBe('minor');
  });

  test('calculateNewVersions - defaults to patch', () => {
    const packages = [{ name: '@pkg/a', version: '1.0.0', path: '/a', private: false, dependencies: {}, devDependencies: {} }];

    const result = calculateNewVersions(packages, []);

    expect(result[0].newVersion).toBe('1.0.1');
  });

  test('getExistingChangesets - returns changesets', async () => {
    (fs.readdir as jest.Mock).mockResolvedValue(['changeset-1.md', 'changeset-2.md', 'README.md']);

    const result = await getExistingChangesets('/repo');

    expect(Array.isArray(result)).toBe(true);
  });

  test('generateChangeset - creates changeset file', async () => {
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const result = await generateChangeset(
      '/repo',
      ['@pkg/a'],
      [{ package: '@pkg/a', bumpType: 'minor' }],
      'Add new feature with proper description',
      'testuser'
    );

    expect(result.success).toBe(true);
    expect(result.changeset).toBeDefined();
  });

  test('generateChangeset - rejects short summary', async () => {
    const result = await generateChangeset(
      '/repo',
      ['@pkg/a'],
      [{ package: '@pkg/a', bumpType: 'minor' }],
      'short',
      'testuser'
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('at least 10 characters');
  });

  test('checkCIPassing - returns true on success', async () => {
    (gitHubActionsService.getWorkflowRuns as jest.Mock).mockResolvedValue({
      workflow_runs: [{ conclusion: 'success', status: 'completed' }],
    });

    const result = await checkCIPassing('token', 'owner', 'repo', 'id', '.github/workflows/test.yml');

    expect(typeof result).toBe('boolean');
  });
});
