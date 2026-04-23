/**
 * Authentication Context Provider
 * Manages authentication state and provides auth functions to the app
 */

import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  DASHBOARD_AUTH_MESSAGES,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_API_ENDPOINTS,
} from '../constants';
import apiClient from './api';
import { cookieUtils } from '../utils/cookies';
import type {
  GitHubUser,
  AuthSession,
  AuthContextType,
  AuthProviderProps,
  UserPermission,
} from '../types/auth-context.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TOKEN_KEY = 'monodog_session_token';
const SESSION_DATA_KEY = 'monodog_session_data';

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load session from cookies if available
   */
  useEffect(() => {
    const savedToken = cookieUtils.get(SESSION_TOKEN_KEY);
    const savedData = cookieUtils.get(SESSION_DATA_KEY);

    if (savedToken && savedData) {
      try {
        const data = JSON.parse(savedData);
        setSession({
          sessionToken: savedToken,
          ...data,
        });
      } catch (err) {
        // Invalid stored data, clear it
        cookieUtils.remove(SESSION_TOKEN_KEY);
        cookieUtils.remove(SESSION_DATA_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  /**
   * Start GitHub OAuth login flow
   */
  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<{ authUrl: string }>(
        DASHBOARD_API_ENDPOINTS.AUTH.LOGIN
      );

      if (!response.success) {
        throw new Error(
          response.error.message || DASHBOARD_AUTH_MESSAGES.LOGIN_FAILED
        );
      }

      // Redirect to GitHub OAuth
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : DASHBOARD_AUTH_MESSAGES.LOGIN_FAILED;
      setError(message);
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle OAuth callback and store session
   */
  const handleOAuthCallback = useCallback(
    async (sessionToken: string, permissionData?: UserPermission | null) => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user info to validate token
        const response = await apiClient.get(DASHBOARD_API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        if (!response.success) {
          throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_USER_INFO);
        }

        const userData = response.data as {
          user: GitHubUser;
          scopes: string[];
          expiresAt: number;
          permission?: UserPermission | null;
        };

        const newSession: AuthSession = {
          sessionToken,
          user: userData.user,
          scopes: userData.scopes || [],
          expiresAt: userData.expiresAt,
        };

        // Store session with permission
        const sessionData = {
          user: userData.user,
          scopes: userData.scopes || [],
          permission: permissionData || userData.permission,
          expiresAt: userData.expiresAt,
        };
        cookieUtils.set(SESSION_TOKEN_KEY, sessionToken);
        cookieUtils.set(SESSION_DATA_KEY, JSON.stringify(sessionData));

        // Set session with permission
        const sessionWithPermission: AuthSession = {
          ...newSession,
          permission: permissionData || userData.permission,
        };
        setSession(sessionWithPermission);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Auth failed';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout and clear session
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      if (session?.sessionToken) {
        await apiClient.post(DASHBOARD_API_ENDPOINTS.AUTH.LOGOUT, undefined);
      }

      // Clear session
      cookieUtils.remove(SESSION_TOKEN_KEY);
      cookieUtils.remove(SESSION_DATA_KEY);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  /**
   * Validate current session with server
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!session?.sessionToken) {
      return false;
    }

    try {
      const response = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.AUTH.VALIDATE,
        undefined
      );

      if (!response.success) {
        // Session invalid
        cookieUtils.remove(SESSION_TOKEN_KEY);
        cookieUtils.remove(SESSION_DATA_KEY);
        setSession(null);
        return false;
      }

      const data = response.data as { valid: boolean };
      return data.valid === true;
    } catch (err) {
      console.error('Session check error:', err);
      return false;
    }
  }, [session]);

  /**
   * Refresh session token
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session?.sessionToken) {
      return false;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.AUTH.REFRESH,
        undefined
      );

      if (!response.success) {
        throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_REFRESH_SESSION);
      }

      const data = response.data as {
        success: boolean;
        sessionToken: string;
        expiresAt: number;
      };

      if (data.success && data.sessionToken) {
        const newSession: AuthSession = {
          sessionToken: data.sessionToken,
          user: session.user,
          scopes: session.scopes,
          expiresAt: data.expiresAt,
        };

        // Update stored session
        cookieUtils.set(SESSION_TOKEN_KEY, data.sessionToken);
        cookieUtils.set(
          SESSION_DATA_KEY,
          JSON.stringify({
            user: session.user,
            scopes: session.scopes,
            expiresAt: data.expiresAt,
          })
        );

        setSession(newSession);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Session refresh error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Validate session periodically
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(
      () => {
        checkSession();
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    return () => clearInterval(interval);
  }, [session, checkSession]);

  /**
   * Check if user has required permission
   */
  const hasPermission = useCallback(
    (requiredPermission: string): boolean => {
      if (!session) {
        console.warn('[Auth] No session available for permission check');
        return false;
      }

      const permissionHierarchy: Record<string, number> = {
        admin: 4,
        maintain: 3,
        write: 2,
        read: 1,
        none: 0,
      };

      // Get user's permission from session or default to 'read'
      let userPermissionString = 'read';
      const sessionPermission = session.permission;

      if (typeof sessionPermission === 'string') {
        // Format 1: Direct string
        userPermissionString = sessionPermission;
      } else if (sessionPermission && typeof sessionPermission === 'object') {
        // Format 2: Check for 'level' property (OAuth response format)
        if (sessionPermission.level) {
          userPermissionString = sessionPermission.level;
        }
        // Format 3: Check for 'permission' property (CachedPermission format)
        else if (sessionPermission.permission) {
          userPermissionString = sessionPermission.permission;
        }
      }

      const userLevel = permissionHierarchy[userPermissionString] || 0;
      const requiredLevel = permissionHierarchy[requiredPermission] || 0;

      console.debug(
        `[Auth] Permission check: user=${userPermissionString}(${userLevel}) required=${requiredPermission}(${requiredLevel}) result=${userLevel >= requiredLevel}`
      );

      return userLevel >= requiredLevel;
    },
    [session]
  );

  const value: AuthContextType = {
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    login,
    logout,
    checkSession,
    refreshSession,
    hasPermission,
    permission: (() => {
      const perm = (session as any)?.permission;
      if (!perm) return null;
      return perm.level || null;
    })(),
  };

  // Expose handleOAuthCallback for use in callback page
  (window as any).__authContext = { handleOAuthCallback };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export types for backward compatibility
export type {
  GitHubUser,
  AuthSession,
  AuthContextType,
  AuthProviderProps,
} from '../types/auth-context.types';

export default AuthContext;
