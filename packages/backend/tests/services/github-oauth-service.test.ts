import { describe, it, expect, vi } from 'vitest';
import {
  mapPermissionToRole,
  hasPermission,
  generateAuthorizationUrl,
} from '../../src/services/github-oauth-service';

describe('GitHub OAuth Service', () => {
  describe('mapPermissionToRole', () => {
    it('should map admin to Admin', () => {
      expect(mapPermissionToRole('admin')).toBe('Admin');
    });

    it('should map maintain to Maintainer', () => {
      expect(mapPermissionToRole('maintain')).toBe('Maintainer');
    });

    it('should map write and read to Collaborator', () => {
      expect(mapPermissionToRole('write')).toBe('Collaborator');
      expect(mapPermissionToRole('read')).toBe('Collaborator');
    });

    it('should map none to Denied', () => {
      expect(mapPermissionToRole('none')).toBe('Denied');
    });
  });

  describe('hasPermission', () => {
    it('should allow equal permissions', () => {
      expect(hasPermission('write', 'write')).toBe(true);
      expect(hasPermission('admin', 'admin')).toBe(true);
    });

    it('should allow higher permissions', () => {
      expect(hasPermission('admin', 'write')).toBe(true);
      expect(hasPermission('maintain', 'read')).toBe(true);
      expect(hasPermission('write', 'read')).toBe(true);
    });

    it('should deny lower permissions', () => {
      expect(hasPermission('read', 'write')).toBe(false);
      expect(hasPermission('none', 'read')).toBe(false);
      expect(hasPermission('write', 'admin')).toBe(false);
    });
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate a valid OAuth URL with default scopes', () => {
      const url = generateAuthorizationUrl(
        'client123',
        'http://localhost/cb',
        'statexyz'
      );
      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=client123');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcb');
      expect(url).toContain('state=statexyz');
      expect(url).toContain('scope=read%3Auser%2Cuser%3Aemail%2Crepo');
    });

    it('should generate a valid OAuth URL with custom scopes', () => {
      const url = generateAuthorizationUrl(
        'client123',
        'http://localhost/cb',
        'statexyz',
        ['repo', 'workflow']
      );
      expect(url).toContain('scope=repo%2Cworkflow');
    });
  });
});
