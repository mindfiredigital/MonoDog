import {
  ArrowPathIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { HealthActionsProps } from '../types/health.types';

export default function HealthActions({
  onRefresh,
  onRunAllTests,
  onRunSecurityAudit,
  onUpdateDependencies,
  loading = false,
}: HealthActionsProps) {
  const ActionButton = ({
    onClick,
    icon,
    label,
    description,
    color = 'blue',
    disabled = false,
  }: {
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    description: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple';
    disabled?: boolean;
  }) => {
    const getColorClasses = () => {
      switch (color) {
        case 'green':
          return 'bg-green-600 hover:bg-green-700 text-white';
        case 'yellow':
          return 'bg-yellow-600 hover:bg-yellow-700 text-white';
        case 'purple':
          return 'bg-purple-600 hover:bg-purple-700 text-white';
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white';
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center space-x-3 mb-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        </div>
        <p className="text-xs text-gray-600 mb-3">{description}</p>
        <button
          onClick={onClick}
          disabled={disabled || loading}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getColorClasses()}`}
        >
          {loading ? 'Running...' : 'Run Now'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          onClick={onRefresh}
          icon={<ArrowPathIcon className="h-5 w-5 text-blue-600" />}
          label="Refresh Data"
          description="Update all health metrics and package status"
          color="blue"
        />

        {onRunAllTests && (
          <ActionButton
            onClick={onRunAllTests}
            icon={<BeakerIcon className="h-5 w-5 text-green-600" />}
            label="Run All Tests"
            description="Execute test suites for all packages"
            color="green"
          />
        )}

        {onRunSecurityAudit && (
          <ActionButton
            onClick={onRunSecurityAudit}
            icon={<ShieldCheckIcon className="h-5 w-5 text-yellow-600" />}
            label="Security Audit"
            description="Check for security vulnerabilities"
            color="yellow"
          />
        )}

        {onUpdateDependencies && (
          <ActionButton
            onClick={onUpdateDependencies}
            icon={<ArrowUpIcon className="h-5 w-5 text-purple-600" />}
            label="Update Dependencies"
            description="Update outdated package dependencies"
            color="purple"
          />
        )}
      </div>

      {/* Health Improvement Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Health Improvement Tips
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <div>• Maintain test coverage above 80% for better code quality</div>
          <div>
            • Run security audits regularly to catch vulnerabilities early
          </div>
          <div>• Keep dependencies up-to-date to benefit from latest fixes</div>
          <div>• Set up automated health checks in your CI/CD pipeline</div>
        </div>
      </div>
    </div>
  );
}
