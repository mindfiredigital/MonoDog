import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
// Unit tests for monorepoService — single consolidated suite

// Mock the dependencies before importing monorepoService
vi.mock('../src/constants/api-config', () => ({
  DASHBOARD_API_ENDPOINTS: {
    PACKAGES: {
      LIST: '/packages',
      DETAILS: (name: string) => `/packages/${name}`,
      STATS: '/packages/stats',
    },
    HEALTH: '/health',
    CI_STATUS: '/ci-status',
    CONFIGURATION: {
      LIST: '/configuration',
      GET: (id: string) => `/configuration/${id}`,
      UPDATE: (id: string) => `/configuration/${id}`,
      DELETE: (id: string) => `/configuration/${id}`,
    },
  },
  API_CONFIG: {
    timeout: 30000,
    retries: 3,
  },
}));

vi.mock('../src/services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn().mockResolvedValue({ success: true, data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Create a mock for Package type
export type Package = {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool';
  description?: string;
  path: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

// Import the actual service
import { monorepoService } from '../src/services/monorepoService';

beforeAll(() => {
  // provide minimal window ENV used by the service
  (global as any).window = { ENV: { API_URL: 'localhost:8999' } };
});

beforeEach(() => {
  vi.clearAllMocks();
  // mock global fetch by default; individual tests will override resolve/reject
  (global as any).fetch = vi.fn();
});

describe('monorepoService (unit)', () => {
  describe('Service exists', () => {
    it('monorepoService should be defined', () => {
      expect(monorepoService).toBeDefined();
    });

    it('should have getPackages method', () => {
      expect(typeof monorepoService.getPackages).toBe('function');
    });

    it('should have getPackage method', () => {
      expect(typeof monorepoService.getPackage).toBe('function');
    });

    it('should have getDependencies method', () => {
      expect(typeof monorepoService.getDependencies).toBe('function');
    });

    it('should have refreshPackages method', () => {
      expect(typeof monorepoService.refreshPackages).toBe('function');
    });

    it('should have getHealthStatus method', () => {
      expect(typeof monorepoService.getHealthStatus).toBe('function');
    });

    it('should have refreshHealthStatus method', () => {
      expect(typeof monorepoService.refreshHealthStatus).toBe('function');
    });

    it('should have updatePackageConfiguration method', () => {
      expect(typeof monorepoService.updatePackageConfiguration).toBe(
        'function'
      );
    });

    it('should have getConfigurationFiles method', () => {
      expect(typeof monorepoService.getConfigurationFiles).toBe('function');
    });

    it('should have saveConfigurationFile method', () => {
      expect(typeof monorepoService.saveConfigurationFile).toBe('function');
    });
  });
});
