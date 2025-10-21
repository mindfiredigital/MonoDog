import React, { useState, useEffect } from 'react';
import Configuration, { DashboardConfig } from '../configuration/Configuration';
import SetupGuide from '../setup-guide/SetupGuide';

// Import sub-components
import {
  Header,
  StatsCards,
  PackageDistribution,
  QuickActions,
  PackageSearchFilter,
  PackageTable,
} from './components';
import { monorepoService } from '../../services/monorepoService';
// Import types and utilities
import { Package, PackageStats } from './types/dashboard.types';
import {
  calculatePackageStats,
  getUniquePackageTypes,
  filterPackages,
  getStatusColor,
  getTypeIcon,
} from './utils/dashboard.utils';

// Configuration interface for customization - imported from Configuration component

// Default configuration that can be overridden
const defaultConfig: DashboardConfig = {
  title: 'Monorepo Dashboard',
  description: 'Visual management and monitoring of your monorepo packages',
  packageTypes: ['app', 'lib', 'tool'],
  features: {
    healthChecks: true,
    ciIntegration: true,
    dependencyGraph: true,
    publishControl: true,
    searchAndFilter: true,
    configurationInspector: true,
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
  },
};

// Mock data - this would be replaced by actual monorepo scanning
// const mockPackages: Package[] = [
//   {
//     name: 'dashboard',
//     version: '1.0.0',
//     type: 'app',
//     path: 'apps/dashboard',
//     dependencies: { react: '^18.0.0', utils: 'workspace:*' },
//     devDependencies: { typescript: '^5.0.0' },
//     scripts: { dev: 'vite', build: 'tsc', test: 'jest' },
//     description: 'Main dashboard application',
//     license: 'MIT',
//     maintainers: ['team@company.com'],
//   },
//   {
//     name: 'utils',
//     version: '1.0.0',
//     type: 'lib',
//     path: 'libs/utils',
//     dependencies: {},
//     devDependencies: { typescript: '^5.0.0' },
//     scripts: { build: 'tsc', test: 'jest' },
//     description: 'Shared utility functions',
//     license: 'MIT',
//     maintainers: ['team@company.com'],
//   },
//   {
//     name: 'backend',
//     version: '1.0.0',
//     type: 'app',
//     path: 'packages/backend',
//     dependencies: { express: '^4.18.0', utils: 'workspace:*' },
//     devDependencies: { typescript: '^5.0.0' },
//     scripts: { dev: 'tsx watch', start: 'tsx', build: 'tsc' },
//     description: 'Backend API server',
//     license: 'MIT',
//     maintainers: ['team@company.com'],
//   },
// ];

export default function Dashboard() {
  const [packages, setPackages] = useState<Package[]>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await monorepoService.getPackages();
        setPackages(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch packages');
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Load configuration from localStorage or environment
  useEffect(() => {
    const savedConfig = localStorage.getItem('monodog-config');
    if (savedConfig) {
      setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
    }
  }, []);

  // Save configuration to localStorage
  const handleConfigSave = (newConfig: DashboardConfig) => {
    setConfig(newConfig);
    localStorage.setItem('monodog-config', JSON.stringify(newConfig));
  };

  // Handle refresh action
  const handleRefresh = () => {
    // In a real app, this would refresh data from the API
    console.log('Refreshing dashboard data...');
  };
  // Calculate derived data using utility functions
  const filteredPackages = filterPackages(
    packages ?? [],
    searchTerm,
    selectedType
  );
  const packageTypes = getUniquePackageTypes(packages ?? []);
  const stats = calculatePackageStats(packages ?? []);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <Header
        config={config}
        onShowSetupGuide={() => setShowSetupGuide(true)}
        onShowConfig={() => setShowConfig(true)}
        onRefresh={handleRefresh}
      />

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Package Type Distribution */}
      <PackageDistribution
        packages={packages ?? []}
        packageTypes={packageTypes}
        getTypeIcon={getTypeIcon}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Search, Filter and Package Table */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <PackageSearchFilter
          searchTerm={searchTerm}
          selectedType={selectedType}
          packageTypes={packageTypes}
          onSearchChange={setSearchTerm}
          onTypeChange={setSelectedType}
        />

        <PackageTable
          packages={filteredPackages}
          getTypeIcon={getTypeIcon}
          getStatusColor={getStatusColor}
        />
      </div>

      {/* Configuration Modal */}
      <Configuration
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={handleConfigSave}
        currentConfig={config}
      />

      {/* Setup Guide Modal */}
      <SetupGuide
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
        onComplete={() => setShowSetupGuide(false)}
      />
    </div>
  );
}
