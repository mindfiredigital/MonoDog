import { useState, useEffect } from 'react';

// Import sub-components
import {
  ConfigurationModal,
  ConfigurationHeader,
  ConfigurationTabs,
  GeneralSettings,
  FeatureToggles,
  BrandingSettings,
  MonorepoSettings,
} from './components';

// Import types and utilities
import {
  ConfigurationProps,
  DashboardConfig,
  ConfigurationTab,
} from './types/config.types';
import { mergeWithDefaults, validateConfig } from './utils/config.utils';

// Re-export types for backward compatibility
export type { DashboardConfig, ConfigurationProps } from './types/config.types';

export default function Configuration({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}: ConfigurationProps) {
  const [config, setConfig] = useState<DashboardConfig>(
    mergeWithDefaults(currentConfig)
  );
  const [activeTab, setActiveTab] = useState<ConfigurationTab>('general');

  useEffect(() => {
    setConfig(mergeWithDefaults(currentConfig));
  }, [currentConfig]);

  const handleSave = () => {
    const validation = validateConfig(config);

    if (!validation.isValid) {
      // In a real application, you might want to show these errors to the user
      console.warn('Configuration validation errors:', validation.errors);
      // For now, we'll save anyway, but you could prevent saving here
    }

    onSave(config);
    onClose();
  };

  const handleConfigChange = (updates: Partial<DashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const renderTabContent = () => {
    const commonProps = {
      config,
      onConfigChange: handleConfigChange,
    };

    switch (activeTab) {
      case 'general':
        return <GeneralSettings {...commonProps} />;
      case 'features':
        return <FeatureToggles {...commonProps} />;
      case 'branding':
        return <BrandingSettings {...commonProps} />;
      case 'monorepo':
        return <MonorepoSettings {...commonProps} />;
      default:
        return <GeneralSettings {...commonProps} />;
    }
  };

  return (
    <ConfigurationModal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <ConfigurationHeader onSave={handleSave} onClose={onClose} />

      {/* Tabs */}
      <ConfigurationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {renderTabContent()}
      </div>
    </ConfigurationModal>
  );
}
