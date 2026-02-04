import {
  CubeIcon,
  DocumentTextIcon,
  ClockIcon,
  HeartIcon,
  Cog6ToothIcon,
} from '../../../../icons/heroicons';
import { PackageDetailTabsProps } from '../types/packages.types';

export default function PackageDetailTabs({
  activeTab,
  onTabChange,
}: PackageDetailTabsProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: CubeIcon },
    {
      id: 'dependencies' as const,
      label: 'Dependencies',
      icon: DocumentTextIcon,
    },
    { id: 'commits' as const, label: 'Recent Commits', icon: ClockIcon },
    { id: 'health' as const, label: 'Health Metrics', icon: HeartIcon },
    { id: 'config' as const, label: 'Configuration', icon: Cog6ToothIcon },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
