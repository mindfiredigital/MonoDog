import React from 'react';
import { ConfigurationTabsProps } from '../types/config.types';
import { getTabDefinitions } from '../utils/config.utils';

export default function ConfigurationTabs({
  activeTab,
  onTabChange,
}: ConfigurationTabsProps) {
  const tabs = getTabDefinitions();

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
