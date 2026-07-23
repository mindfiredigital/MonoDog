import { PlayIcon } from '../../../../icons/heroicons';
import { useAuth } from '../../../../services/auth-context';

interface CIIntegrationHeaderProps {
  onTriggerBuild: () => void;
}

export default function CIIntegrationHeader({
  onTriggerBuild,
}: CIIntegrationHeaderProps) {
  const { session } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-heading text-2xl">CI/CD Integration</h1>
        <p className="text-body mt-1">
          Monitor and manage continuous integration and deployment pipelines
        </p>
      </div>
      <div className="flex space-x-2">
        {session?.permission?.role !== 'Viewer' && (
          <button
            onClick={onTriggerBuild}
            className="btn-secondary flex items-center space-x-2"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Trigger Build</span>
          </button>
        )}
      </div>
    </div>
  );
}
