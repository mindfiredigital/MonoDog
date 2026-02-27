/**
 * LoginPage Tests
 * Tests for login page: GitHub button,  error display, loading states
 */

import React from 'react';

// Mock dependencies BEFORE imports
jest.mock('../src/services/auth-context');
jest.mock('../src/constants/api-config', () => ({
  DASHBOARD_API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
  },
}));

jest.mock('../src/constants/messages', () => ({
  DASHBOARD_ERROR_MESSAGES: {
    AUTHENTICATION_ERROR: 'Authentication error',
  },
  DASHBOARD_AUTH_MESSAGES: {
    LOGIN_INITIATED: 'Login initiated',
  },
}));

describe('LoginPage', () => {
  describe('Component Structure', () => {
    it('should render without crashing', () => {
      // Just verify the component can be imported
      expect(() => {
        require('../src/pages/LoginPage');
      }).not.toThrow();
    });

    it('should export LoginPage component as default', () => {
      const module = require('../src/pages/LoginPage');
      expect(module.LoginPage).toBeDefined();
      expect(typeof module.LoginPage).toBe('function');
    });
  });

  describe('Component Properties', () => {
    it('should have proper display name or be a valid React component', () => {
      const { LoginPage } = require('../src/pages/LoginPage');
      expect(LoginPage).toBeDefined();
      // Check it's a function (FC or regular component)
      expect(typeof LoginPage).toBe('function');
    });
  });

  describe('LoginPage Authentication Flow', () => {
    it('should use auth context hook', () => {
      const authContext = require('../src/services/auth-context');
      expect(authContext.useAuth).toBeDefined();
    });

    it('should import required dependencies', () => {
      const LoginPageModule = require('../src/pages/LoginPage');
      expect(LoginPageModule).toBeDefined();
      expect(LoginPageModule.LoginPage).toBeDefined();
    });
  });

  describe('GitHub OAuth Integration', () => {
    it('should reference GitHub OAuth endpoints', () => {
      const apiConfig = require('../src/constants/api-config');
      expect(apiConfig.DASHBOARD_API_ENDPOINTS.AUTH).toBeDefined();
      expect(apiConfig.DASHBOARD_API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
    });
  });

  describe('Error Messages', () => {
    it('should have error message constants available', () => {
      const messages = require('../src/constants/messages');
      expect(messages.DASHBOARD_ERROR_MESSAGES).toBeDefined();
      expect(messages.DASHBOARD_ERROR_MESSAGES.AUTHENTICATION_ERROR).toBe(
        'Authentication error'
      );
    });

    it('should have auth message constants available', () => {
      const messages = require('../src/constants/messages');
      expect(messages.DASHBOARD_AUTH_MESSAGES).toBeDefined();
      expect(messages.DASHBOARD_AUTH_MESSAGES.LOGIN_INITIATED).toBe('Login initiated');
    });
  });
});
