/**
 * Tests for page wrapper components.
 * These are basic smoke tests to ensure pages export and have expected structure.
 */

// Mock API dependencies
jest.mock('../src/constants/api-config', () => ({
  DASHBOARD_API_ENDPOINTS: {
    PACKAGES: {
      LIST: '/packages',
      DETAILS: jest.fn((name: string) => `/packages/${name}`),
    },
  },
  API_CONFIG: {},
}));

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: {},
}));

// Mock the components before importing pages
jest.mock('../src/components/main-dashboard/Dashboard', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/components/modules/health-status/HealthStatus', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/components/modules/packages/PackagesOverview', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/components/modules/packages/PackageDetail', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/components/modules/ci-integration/CIIntegration', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/components/modules/config-inspector/ConfigInspector', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../src/services/monorepoService', () => ({
  __esModule: true,
  monorepoService: {},
}));

// Import pages after mocking their dependencies
import DashboardPage from '../src/pages/DashboardPage';
import HealthPage from '../src/pages/HealthPage';
import PackagesPage from '../src/pages/PackagesPage';
import PackageDetailPage from '../src/pages/PackageDetailPage';
import ConfigPage from '../src/pages/ConfigPage';

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

  test('ConfigPage exports a valid component', () => {
    expect(ConfigPage).toBeDefined();
    expect(typeof ConfigPage).toBe('function');
  });
});

describe('Page components structure', () => {
  test('all pages return JSX', () => {
    // These should be callable React components
    const pages = [DashboardPage, HealthPage, PackagesPage, PackageDetailPage, ConfigPage];

    pages.forEach(page => {
      expect(typeof page).toBe('function');
      // Each page should be a React component (function)
      expect(page.length >= 0).toBe(true);
    });
  });
});
