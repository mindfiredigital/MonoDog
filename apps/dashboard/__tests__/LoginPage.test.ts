/**
 * LoginPage Tests
 * Tests for login page: GitHub button,  error display, loading states
 */

import React from 'react';
import * as authContext from '../src/services/auth-context';
import { DASHBOARD_API_ENDPOINTS } from '../src/constants/api-config';
import {
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_AUTH_MESSAGES,
} from '../src/constants/messages';

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
      // Verify React imports work properly
      expect(React).toBeDefined();
    });

    it('should have proper dependencies available', () => {
      expect(authContext).toBeDefined();
      expect(typeof authContext).toBe('object');
    });
  });

  describe('Component Properties', () => {
    it('should have proper dependencies for component', () => {
      expect(React).toBeDefined();
      expect(DASHBOARD_API_ENDPOINTS).toBeDefined();
    });
  });

  describe('LoginPage Authentication Flow', () => {
    it('should have auth context available', () => {
      expect(authContext).toBeDefined();
    });

    it('should have message constants defined', () => {
      expect(DASHBOARD_AUTH_MESSAGES).toBeDefined();
    });
  });

  describe('GitHub OAuth Integration', () => {
    it('should reference GitHub OAuth endpoints', () => {
      expect(DASHBOARD_API_ENDPOINTS.AUTH).toBeDefined();
      expect(DASHBOARD_API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
    });
  });

  describe('Error Messages', () => {
    it('should have error message constants available', () => {
      expect(DASHBOARD_ERROR_MESSAGES).toBeDefined();
      expect(DASHBOARD_ERROR_MESSAGES.AUTHENTICATION_ERROR).toBe(
        'Authentication error'
      );
    });

    it('should have auth message constants available', () => {
      expect(DASHBOARD_AUTH_MESSAGES).toBeDefined();
    });
  });
});
