import { CheckIcon } from '@heroicons/react/24/outline';
import { StepNavigationProps } from '../types/setup.types';

export default function StepNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onComplete,
  isLastStep,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
          canGoPrevious
            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Previous
      </button>

      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {isLastStep ? (
        <button
          onClick={onComplete}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Complete Setup</span>
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      )}
    </div>
  );
}
