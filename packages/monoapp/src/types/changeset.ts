/**
 * Changeset and Version Management Types
 */

export type VersionBump = 'major' | 'minor' | 'patch';

export interface Package {
  name: string;
  version: string;
  path: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface VersionBumpItem {
  package: string;
  currentVersion: string;
  newVersion: string;
  bumpType: VersionBump;
}

export interface PublishPlan {
  packages: VersionBumpItem[];
  changesets: string[];
  timestamp: Date;
}
