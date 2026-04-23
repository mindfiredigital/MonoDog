import { useState, useEffect } from 'react';
import Configuration, { DashboardConfig } from '../configuration/Configuration';
import SetupGuide from '../setup-guide/SetupGuide';
import { DASHBOARD_ERROR_MESSAGES } from '../../constants/messages';
import { cookieUtils } from '../../utils/cookies';

// Import sub-components
import {
  Header,
  StatsCards,
  QuickActions,
  PackageSearchFilter,
  PackageTable,
} from './components';
import { monorepoService } from '../../services/monorepoService';
// Import types and utilities
import { Package } from './types/dashboard.types';
import {
  calculatePackageStats,
  getUniquePackageTypes,
  filterPackages,
  getStatusColor,
  getTypeIcon,
} from './utils/dashboard.utils';
import { LoadingState, ErrorState } from '../modules/packages/components';
import { defaultConfig } from './constants/dashboard';

// Configuration interface for customization - imported from Configuration component

export default function Dashboard() {
  const [packages, setPackages] = useState<Package[]>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await monorepoService.getPackages();
        setPackages(data as unknown as Package[]);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Load configuration from cookies or environment
  useEffect(() => {
    const savedConfig = cookieUtils.get('monodog-config');
    if (savedConfig) {
      setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
    }
  }, []);

  // Save configuration to cookies
  const handleConfigSave = (newConfig: DashboardConfig) => {
    setConfig(newConfig);
    cookieUtils.set('monodog-config', JSON.stringify(newConfig));
  };

  // Handle refresh action
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setLoading(true);
      try {
        const data = await monorepoService.refreshPackages();
        setPackages(data as unknown as Package[]);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
        console.error('Error fetching package data:', err);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
      console.error('Error refreshing package data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading && !packages) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

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
      {/* Show refreshing overlay when refreshing with existing data */}
      {refreshing && packages && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Refreshing packages...</p>
          </div>
        </div>
      )}
      {/* Header Section */}
      <Header
        config={config}
        onShowSetupGuide={() => setShowSetupGuide(true)}
        onShowConfig={() => setShowConfig(true)}
        onRefresh={handleRefresh}
      />

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

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
