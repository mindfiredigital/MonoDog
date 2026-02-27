/**
 * Component-Specific Types
 */

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  owner: string;
  repo: string;
}

export interface HealthData {
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  lastUpdated: number;
}

export interface GraphLegendProps {
  onToggleNode?: (nodeId: string) => void;
}

export interface DependenciesTabProps {
  packageName: string;
  dependencies?: Record<string, string>;
}

export interface RecentCommitsTabProps {
  packageName: string;
  limit?: number;
}

export interface PackagesTableProps {
  packages: Array<{ name: string; version: string; type: string }>;
  onSelectPackage?: (packageName: string) => void;
}

export interface DependencyGraphHeaderProps {
  title?: string;
  onRefresh?: () => void;
}

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export interface HealthMetricsTabProps {
  packageName: string;
}

export interface PackageDetailHeaderProps {
  packageName: string;
  version?: string;
  type?: string;
}

export interface ConfigurationTabProps {
  packageName: string;
  configFiles?: Array<{ name: string; path: string; content: string }>;
}

export interface PackageStatsProps {
  stats: Record<string, number>;
}

export interface SearchAndFilterProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

export interface ConfigurationHeaderProps {
  title?: string;
  onSave?: () => void;
}

export interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: Record<string, any>) => void;
}

export interface PackageSelectorProps {
  onSelect?: (packageName: string) => void;
  selectedPackages?: string[];
}

export interface ChangesetPreviewProps {
  changes: Array<{ packageName: string; type: string; version: string }>;
}
