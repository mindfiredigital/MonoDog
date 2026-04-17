import { Package } from './dashboard.types';

export interface PackageDistributionProps {
  packages: Package[];
  packageTypes: string[];
  getTypeIcon: (type: string) => React.ReactNode;
}

export interface PackageSearchFilterProps {
  searchTerm: string;
  selectedType: string;
  packageTypes: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export interface PackageTableProps {
  packages: Package[];
  getTypeIcon: (type: string) => React.ReactNode;
  getStatusColor: (type: string) => string;
}
