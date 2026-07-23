// Shared types for publish control components

export interface Package {
  name: string;
  currentVersion: string;
  nextVersion: string;
  status: 'ready' | 'building' | 'testing' | 'published' | 'failed';
  lastPublished: string;
  changelog: string;
  commits: number;
  dependencies: string[];
  publishType: 'patch' | 'minor' | 'major' | 'prerelease';
}

export interface Release {
  id: string;
  packageName: string;
  version: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  changelog: string;
  author: string;
}

export interface PublishStats {
  readyToPublish: number;
  inProgress: number;
  published: number;
}

export interface PublishControlState {
  packages: Package[];
  selectedPackage: string;
  selectedStatus: string;
  loading: boolean;
  error: string | null;
}

export interface ChangelogViewerProps {
  packageName: string;
}

export interface ScheduleReleaseData {
  packageName: string;
  releaseVersion: string;
  scheduledAt: string;
}

export interface ReleaseScheduleProps {
  releases: Release[];
  packages: Package[];
  onSchedule: (releaseData: {
    packageName: string;
    releaseVersion: string;
    scheduledAt: string;
  }) => Promise<void>;
}
