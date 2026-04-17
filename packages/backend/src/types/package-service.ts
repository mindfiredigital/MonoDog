import type { PackageReport } from './scanner';

/**
 * Transformed package with standard properties
 */
export interface TransformedPackage {
  name: string;
  version?: string;
  type?: string;
  path?: string;
  description?: string;
  license?: string;
  repository: Record<string, unknown>;
  scripts: Record<string, unknown>;
  dependencies: Record<string, unknown>;
  devDependencies: Record<string, unknown>;
  peerDependencies: Record<string, unknown>;
  maintainers: string[];
  status?: string;
  createdAt?: Date;
  lastUpdated?: Date;
}

/**
 * Package detail with report and CI status
 */
export interface PackageDetail extends TransformedPackage {
  report?: PackageReport;
  ciStatus?: Record<string, unknown>;
}
