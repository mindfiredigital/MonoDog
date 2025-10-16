// Shared types for setup guide components

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  action?: () => void;
}

export interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export interface SetupProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
}

export interface StepContentProps {
  step: SetupStep;
  onStepComplete: (stepId: string) => void;
}

export interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  isLastStep: boolean;
}
