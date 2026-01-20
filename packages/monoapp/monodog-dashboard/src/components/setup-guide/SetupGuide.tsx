import { useState } from 'react';

// Import sub-components
import {
  SetupModal,
  SetupHeader,
  SetupProgress,
  StepContent,
  StepNavigation,
} from './components';

// Import types and utilities
import { SetupGuideProps, SetupStep } from './types/setup.types';
import {
  getInitialSteps,
  calculateProgress,
  canProceedToNext,
  isSetupComplete,
  markStepAsComplete,
} from './utils/setup.utils';

// Re-export types for backward compatibility
export type { SetupStep, SetupGuideProps } from './types/setup.types';

export default function SetupGuide({
  isOpen,
  onClose,
  onComplete,
}: SetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>(getInitialSteps());

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    const updatedSteps = markStepAsComplete(steps, stepId);
    setSteps(updatedSteps);

    // Auto-advance to next step if current step is completed
    const currentStepCompleted = updatedSteps[currentStep].completed;
    if (currentStepCompleted && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (isSetupComplete(steps)) {
      onComplete();
      onClose();
    }
  };

  // Calculate derived values
  const progress = calculateProgress(steps, currentStep);
  const canGoNext = canProceedToNext(steps, currentStep);
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  return (
    <SetupModal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <SetupHeader onClose={onClose} />

      {/* Progress Indicator */}
      <SetupProgress progress={progress} />

      {/* Step Content */}
      <StepContent step={currentStepData} onStepComplete={handleStepComplete} />

      {/* Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        isLastStep={isLastStep}
      />
    </SetupModal>
  );
}
