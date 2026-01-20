import os from 'os';
import fs from 'fs';
import path from 'path';

import {
  resolveWorkspaceGlobs,
  getWorkspacesFromRoot,
  parsePackageInfo,
  calculatePackageHealth,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  checkOutdatedDependencies,
  getPackageSize,
} from '../src/utils/utilities';

import type { PackageInfo } from '../src/utils/utilities';

describe('utilities module', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'monoapp-test-'));
  });

  afterEach(() => {
    // recursive remove
    try {
      fs.rmdirSync(tmpRoot, { recursive: true });
    } catch (e) {
      // ignore
    }
  });

  test('getWorkspacesFromRoot reads workspaces from package.json', () => {
    const pkg = { workspaces: ['packages/*', 'apps/*'] };
    fs.writeFileSync(path.join(tmpRoot, 'package.json'), JSON.stringify(pkg));

    const result = getWorkspacesFromRoot(tmpRoot);
    expect(result).toEqual(['packages/*', 'apps/*']);
  });

  test('resolveWorkspaceGlobs resolves folders with /*', () => {
    const packagesDir = path.join(tmpRoot, 'packages');
    fs.mkdirSync(packagesDir, { recursive: true });
    fs.mkdirSync(path.join(packagesDir, 'one'));
    fs.mkdirSync(path.join(packagesDir, 'two'));

    const resolved = resolveWorkspaceGlobs(tmpRoot, ['packages/*']);
    expect(resolved).toEqual(expect.arrayContaining(['packages/one', 'packages/two']));
  });

  test('parsePackageInfo returns null when package.json missing and returns data when present', () => {
    const pkgPath = path.join(tmpRoot, 'packages', 'mypkg');
    fs.mkdirSync(pkgPath, { recursive: true });

    expect(parsePackageInfo(pkgPath, 'mypkg')).toBeNull();

    const pkgJson = {
      name: 'mypkg',
      version: '0.1.0',
      scripts: { start: 'node index.js' },
      dependencies: { dep: '^1.0.0' },
      maintainers: ['me'],
    };
    fs.writeFileSync(path.join(pkgPath, 'package.json'), JSON.stringify(pkgJson));

    const info = parsePackageInfo(pkgPath, 'mypkg');
    expect(info).not.toBeNull();
    expect(info?.name).toBe('mypkg');
    expect(info?.type).toBe('app');

    const forced = parsePackageInfo(pkgPath, 'mypkg', 'tool');
    expect(forced?.type).toBe('tool');
  });

  test('calculatePackageHealth scoring', () => {
    // success + 80% coverage + pass lint + pass security
    const health = calculatePackageHealth('success', 80, 'pass', 'pass');
    // 30 + 20 + 25 + 20 = 95
    expect(health.overallScore).toBe(95);

    const health2 = calculatePackageHealth('failed', 10, 'fail', 'unknown');
    // 0 + 2.5 + 0 + 10 = ~13 -> rounded
    expect(typeof health2.overallScore).toBe('number');
  });

  test('generateMonorepoStats and outdated detection', () => {
    const pkgA: PackageInfo = {
      name: 'a',
      version: '1.0.0',
      type: 'app',
      path: 'packages/a',
      dependencies: { dep1: '^1.0.0' },
      devDependencies: {},
      peerDependencies: {},
      scripts: {},
      maintainers: [],
    };
    const pkgB: PackageInfo = {
      name: 'b',
      version: '1.0.0',
      type: 'lib',
      path: 'packages/b',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      scripts: {},
      maintainers: [],
    };

    const stats = generateMonorepoStats([pkgA, pkgB]);
    expect(stats.totalPackages).toBe(2);
    expect(stats.apps).toBe(1);
    expect(stats.libraries).toBe(1);
    expect(stats.totalDependencies).toBeGreaterThanOrEqual(1);

    const outdated = checkOutdatedDependencies(pkgA);
    expect(outdated.length).toBeGreaterThan(0);
  });

  test('findCircularDependencies detects cycles', () => {
    const a: PackageInfo = { name: 'a', version: '1', type: 'lib', path: 'a', dependencies: { b: '^1' }, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] };
    const b: PackageInfo = { name: 'b', version: '1', type: 'lib', path: 'b', dependencies: { c: '^1' }, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] };
    const c: PackageInfo = { name: 'c', version: '1', type: 'lib', path: 'c', dependencies: { a: '^1' }, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] };

    const cycles = findCircularDependencies([a, b, c]);
    expect(cycles.length).toBeGreaterThan(0);
  });

  test('generateDependencyGraph returns nodes and internal edges', () => {
    const a: PackageInfo = { name: 'a', version: '1', type: 'lib', path: 'a', dependencies: { b: '^1' }, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] };
    const b: PackageInfo = { name: 'b', version: '1', type: 'lib', path: 'b', dependencies: {}, devDependencies: {}, peerDependencies: {}, scripts: {}, maintainers: [] };

    const graph = generateDependencyGraph([a, b]);
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.some(e => e.from === 'a' && e.to === 'b')).toBe(true);
  });

  test('getPackageSize calculates files and size', () => {
    const pkgDir = path.join(tmpRoot, 'pkgsize');
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(path.join(pkgDir, 'file1.txt'), 'hello');
    fs.mkdirSync(path.join(pkgDir, 'sub'));
    fs.writeFileSync(path.join(pkgDir, 'sub', 'file2.txt'), 'world');

    const size = getPackageSize(pkgDir);
    expect(size.files).toBe(2);
    expect(size.size).toBeGreaterThanOrEqual(10);
  });
});
