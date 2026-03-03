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

export interface GraphLegendProps {
  show: boolean;
}

export interface DependenciesTabProps {
  packageData: any;
}

export interface RecentCommitsTabProps {
  packageData: any;
}

export interface PackagesTableProps {
  packages: any[];
  sorting: any;
  onSortChange: (sorting: any) => void;
}

export interface DependencyGraphHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
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
  packageData: any;
}

export interface ConfigurationTabProps {
  packageData: any;
}

export interface PackageStatsProps {
  stats: any;
}

export interface SearchAndFilterProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  availableTypes: string[];
  availableStatuses: string[];
}

export interface ConfigurationHeaderProps {
  onSave: () => void;
  onClose: () => void;
}

export interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface PackageSelectorProps {
  packages: any[];
  onConfirm: (packages: any[]) => void;
  loading?: boolean;
}

export interface ChangesetPreviewProps {
  packages: any[];
  existingChangesets: any[];
  onConfirm: (summary: string) => void;
  onBack: () => void;
  loading?: boolean;
}
