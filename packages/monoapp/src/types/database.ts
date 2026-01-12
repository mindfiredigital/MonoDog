/**
 * Database related types
 */

export interface Commit {
  hash: string;
  message?: string;
  author?: string;
  date?: string;
  type?: string;
}
