/**
 * Authentication Service DTOs and Response Types
 */

import type { GitHubUser } from './auth';

/**
 * Login Response DTO
 */
export interface LoginUrlResponse {
  authUrl: string;
  state: string;
}

/**
 * OAuth Callback Response DTO
 */
export interface OAuthCallbackResponse {
  sessionToken: string;
  redirectUrl: string;
  user: Partial<GitHubUser> & { id: number; login: string; avatar_url: string };
  permission: {
    level: string;
    role: string;
    owner: string;
    repo: string;
  } | null;
}

/**
 * Session Response DTO
 */
export interface SessionResponse {
  user: GitHubUser;
  scopes: string[];
  expiresAt: number;
  permission: {
    level: string;
    role: string;
    owner?: string;
    repo?: string;
  } | null;
}

/**
 * Validation Response DTO
 */
export interface ValidationResponse {
  valid: boolean;
  expiresAt: number;
}
