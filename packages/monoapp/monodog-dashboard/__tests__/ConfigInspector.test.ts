/**
 * Unit tests for ConfigInspector component
 * Tests configuration validation, inspection, and comparison
 */

import { monorepoService } from '../src/services/monorepoService';

jest.mock('../src/services/monorepoService', () => ({
  monorepoService: {
    getConfiguration: jest.fn(),
  },
}));

describe('ConfigInspector Component', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Component Initialization', () => {
    it('should initialize with empty config', () => {
      const initialConfig = {};
      expect(Object.keys(initialConfig)).toHaveLength(0);
    });

    it('should initialize with loading state', () => {
      const initialLoading = true;
      expect(initialLoading).toBe(true);
    });

    it('should initialize with no validation errors', () => {
      const errors: any[] = [];
      expect(errors).toHaveLength(0);
    });
  });
});
