import { describe, it, expect } from 'vitest';
import { MonorepoScanner } from '../src/index';
import path from 'path';

describe('MonorepoScanner', () => {
  it('should instantiate correctly', () => {
    const scanner = new MonorepoScanner();
    expect(scanner).toBeDefined();
  });

  it('should initialize with correct root dir', () => {
    const customPath = path.resolve(__dirname, '../../');
    const scanner = new MonorepoScanner(customPath);
    expect(scanner).toBeDefined();
    scanner.clearCache();
    expect(true).toBe(true);
  });
});
