/**
 * Authentication Context Types
 */

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface UserPermission {
  level?: string;
  role?: string;
  owner?: string;
  repo?: string;
  permission?: string; // For CachedPermission compatibility
  userId?: number;
  username?: string;
  cachedAt?: number;
  ttl?: number;
}

export interface AuthSession {
  sessionToken: string;
  user: GitHubUser;
  scopes: string[];
  expiresAt: number;
  permission?: UserPermission | null;
}

export interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  hasPermission: (requiredPermission: string) => boolean;
  permission: string | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
