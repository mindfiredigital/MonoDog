import { describe, it, expect } from 'vitest';
import { ciStatusManager } from '../src/index';

describe('CIStatusManager', () => {
  it('should initialize with default providers', () => {
    const providers = ciStatusManager.getProviders();
    expect(providers.length).toBeGreaterThan(0);
    expect(providers.find(p => p.name === 'GitHub Actions')).toBeDefined();
  });

  it('should allow adding and removing a provider', () => {
    ciStatusManager.addProvider({
      name: 'TestProvider',
      type: 'github',
      baseUrl: 'http://test',
    });
    let providers = ciStatusManager.getProviders();
    expect(providers.find(p => p.name === 'TestProvider')).toBeDefined();

    ciStatusManager.removeProvider('TestProvider');
    providers = ciStatusManager.getProviders();
    expect(providers.find(p => p.name === 'TestProvider')).toBeUndefined();
  });
});
