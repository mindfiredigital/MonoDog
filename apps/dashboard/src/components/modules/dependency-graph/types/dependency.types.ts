// Shared types for dependency graph module components

export interface PackageNode {
  id: string;
  name: string;
  type: 'app' | 'lib' | 'tool';
  version: string;
  status: 'healthy' | 'warning' | 'error';
  dependencies: string[];
  dependents: string[];
  x: number;
  y: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'direct' | 'peer' | 'dev';
  status: 'healthy' | 'warning' | 'error';
}

export interface CircularDependency {
  cycle: string[];
  severity: 'low' | 'medium' | 'high';
  impact: string;
}

export interface GraphStats {
  totalPackages: number;
  totalDependencies: number;
  circularDependencies: number;
  leafPackages: number;
  rootPackages: number;
  maxDepth: number;
  avgDependencies: number;
}

export interface DependencyGraphProps {
  packages: PackageNode[];
  selectedPackage?: string | null;
  onPackageSelect: (packageId: string | null) => void;
  viewMode: 'graph' | 'list';
  onViewModeChange: (mode: 'graph' | 'list') => void;
}

export interface GraphVisualizationProps {
  packages: PackageNode[];
  selectedPackage: string | null;
  hoveredPackage: string | null;
  onPackageSelect: (packageId: string | null) => void;
  onPackageHover: (packageId: string | null) => void;
  layout: 'hierarchical' | 'circular' | 'force';
}

export interface DependencyListProps {
  packages: PackageNode[];
  selectedPackage: string | null;
  onPackageSelect: (packageId: string) => void;
  sortBy: 'name' | 'dependencies' | 'dependents' | 'status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
}

export interface DependencyDetailsProps {
  package: PackageNode | null;
  packages: PackageNode[];
  onClose: () => void;
}

export interface GraphToolbarProps {
  viewMode: 'graph' | 'list';
  onViewModeChange: (mode: 'graph' | 'list') => void;
  layout: 'hierarchical' | 'circular' | 'force';
  onLayoutChange: (layout: 'hierarchical' | 'circular' | 'force') => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
}

export interface GraphStatsProps {
  stats: GraphStats;
  packages: PackageNode[];
}

export interface CircularDependenciesProps {
  cycles: CircularDependency[];
  packages: PackageNode[];
  onPackageSelect: (packageId: string) => void;
}
