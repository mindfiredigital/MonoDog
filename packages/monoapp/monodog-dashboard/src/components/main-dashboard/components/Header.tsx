import { ArrowPathIcon, CogIcon } from '@heroicons/react/24/outline';
import { DashboardConfig } from '../../configuration/Configuration';

interface HeaderProps {
  config: DashboardConfig;
  onShowSetupGuide: () => void;
  onShowConfig: () => void;
  onRefresh: () => void;
}

export default function Header({
  config,
  onShowSetupGuide,
  onShowConfig,
  onRefresh,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-heading text-3xl">{config.title}</h1>
        <p className="text-body mt-2">{config.description}</p>
        <button
          onClick={onShowSetupGuide}
          className="hidden text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
        >
          First time? Run the setup guide
        </button>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onRefresh}
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Refresh</span>
        </button>
        <button
          onClick={onShowConfig}
          className="hidden btn-ghost flex items-center space-x-2"
        >
          <CogIcon className="w-5 h-5" />
          <span>Configure</span>
        </button>
      </div>
    </div>
  );
}
