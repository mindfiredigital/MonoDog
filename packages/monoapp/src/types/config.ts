/**
 * Configuration types for the monodog application
 */

export interface MonodogConfig {
  workspaces: [];
  database: {
    type: 'postgres' | 'mysql' | 'sqlite';
    host: string;
    port: number;
    user: string;
    path: string; // Used for SQLite path or general data storage path
  };
  dashboard: {
    host: string;
    port: number;
  };
  server: {
    host: string;
    port: number;
  };
}
