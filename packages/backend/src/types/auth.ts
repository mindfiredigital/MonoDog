/**
 * GitHub OAuth and Authentication Types
 */

/**
 * GitHub user information from OAuth
 */
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

/**
 * Repository permission levels
 * Follows GitHub's permission model
 */
export type RepositoryPermission =
  | 'admin'
  | 'maintain'
  | 'write'
  | 'read'
  | 'none';

/**
 * Mapped permission roles for MonoDog
 */
export type MonoDogPermissionRole =
  | 'Admin'
  | 'Maintainer'
  | 'Collaborator'
  | 'Denied';

/**
 * GitHub repository permission response
 */
export interface RepositoryPermissionResponse {
  permission: RepositoryPermission;
  user?: GitHubUser;
}

/**
 * User session with GitHub auth details
 */
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  user: GitHubUser;
  scopes: string[];
  permission?: CachedPermission | null; // User's repository permission (optional until fetched)
}

/**
 * Repository access for a user
 */
export interface RepositoryAccess {
  owner: string;
  repo: string;
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
  lastValidated: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cached permission entry
 */
export interface CachedPermission {
  userId: number;
  username: string;
  owner: string;
  repo: string;
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
  cachedAt: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * OAuth state for CSRF protection
 */
export interface OAuthState {
  state: string;
  createdAt: number;
  redirectUrl?: string;
}

/**
 * API response for authentication endpoints
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  session?: AuthSession;
  error?: string;
}

/**
 * API response for permission check
 */
export interface PermissionCheckResponse {
  permission: RepositoryPermission;
  role: MonoDogPermissionRole;
  canAdmin: boolean;
  canMaintain: boolean;
  canWrite: boolean;
  canRead: boolean;
  denied: boolean;
}

/**
 * Extended Express Request with auth details
 */
export interface AuthenticatedRequest {
  session: AuthSession;
  permission?: RepositoryAccess;
  repositoryContext?: {
    owner: string;
    repo: string;
  };
}
