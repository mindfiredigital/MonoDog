import { describe, it, expect, vi } from 'vitest';
import {
  findMonorepoRoot,
  getFileType,
  containsSecrets,
} from '../../src/services/config.service';

describe('Config Service', () => {
  describe('getFileType', () => {
    it('should identify json files', () => {
      expect(getFileType('test.json')).toBe('json');
    });

    it('should identify yaml files', () => {
      expect(getFileType('config.yml')).toBe('yaml');
      expect(getFileType('config.yaml')).toBe('yaml');
    });

    it('should identify typescript files', () => {
      expect(getFileType('app.ts')).toBe('typescript');
    });
  });

  describe('containsSecrets', () => {
    it('should detect password keywords', () => {
      expect(containsSecrets('password=123', '.env')).toBe(true);
      expect(containsSecrets('DATABASE_URL=postgres', '.env')).toBe(true);
    });

    it('should not false positive on non-env files without explicit keywords', () => {
      expect(containsSecrets('const x = 5;', 'app.ts')).toBe(false);
    });
  });
});
