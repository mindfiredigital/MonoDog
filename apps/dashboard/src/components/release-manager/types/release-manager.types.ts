/**
 * Release Manager Component Types
 */

export interface SelectedPackage {
  name: string;
  currentVersion: string;
  newVersion: string;
  bumpType: 'major' | 'minor' | 'patch';
  affectedDependencies: string[];
}

export interface ChangesetData {
  packages: SelectedPackage[];
  summary: string;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    permissions: boolean;
    workingTreeClean: boolean;
    ciPassing: boolean;
    versionAvailable: boolean;
  };
}
