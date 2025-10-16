import { SetupProgress as ProgressType } from '../types/setup.types';

interface SetupProgressProps {
  progress: ProgressType;
}

export default function SetupProgress({ progress }: SetupProgressProps) {
  const { currentStep, totalSteps, completedSteps } = progress;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {completedSteps} completed
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
