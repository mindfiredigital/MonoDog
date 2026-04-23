import { ExclamationTriangleIcon } from '../../../../icons/heroicons';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto" />
        <p className="mt-4 text-red-600">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
