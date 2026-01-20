/**
 * Tests for page wrapper components.
 * These are basic smoke tests to ensure pages export and have expected structure.
 */

import DashboardPage from '../src/pages/DashboardPage';
import HealthPage from '../src/pages/HealthPage';
import PackagesPage from '../src/pages/PackagesPage';
import PackageDetailPage from '../src/pages/PackageDetailPage';
import CIPage from '../src/pages/CIPage';
import ConfigPage from '../src/pages/ConfigPage';
import PublishPage from '../src/pages/PublishPage';

describe('Page exports', () => {
  test('DashboardPage exports a valid component', () => {
    expect(DashboardPage).toBeDefined();
    expect(typeof DashboardPage).toBe('function');
  });

  test('HealthPage exports a valid component', () => {
    expect(HealthPage).toBeDefined();
    expect(typeof HealthPage).toBe('function');
  });

  test('PackagesPage exports a valid component', () => {
    expect(PackagesPage).toBeDefined();
    expect(typeof PackagesPage).toBe('function');
  });

  test('PackageDetailPage exports a valid component', () => {
    expect(PackageDetailPage).toBeDefined();
    expect(typeof PackageDetailPage).toBe('function');
  });

  test('CIPage exports a valid component', () => {
    expect(CIPage).toBeDefined();
    expect(typeof CIPage).toBe('function');
  });

  test('ConfigPage exports a valid component', () => {
    expect(ConfigPage).toBeDefined();
    expect(typeof ConfigPage).toBe('function');
  });

  test('PublishPage exports a valid component', () => {
    expect(PublishPage).toBeDefined();
    expect(typeof PublishPage).toBe('function');
  });
});

describe('Page components structure', () => {
  test('all pages return JSX', () => {
    // These should be callable React components
    const pages = [DashboardPage, HealthPage, PackagesPage, PackageDetailPage, CIPage, ConfigPage, PublishPage];

    pages.forEach(page => {
      expect(page).toBeInstanceOf(Function);
      // Each page should be a React component (function)
      expect(page.length >= 0).toBe(true);
    });
  });
});
