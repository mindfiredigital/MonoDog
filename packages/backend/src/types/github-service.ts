/**
 * GitHub API request options
 */
export interface GitHubRequestOptions {
  hostname: string;
  path: string;
  method: string;
  headers: Record<string, string>;
}
