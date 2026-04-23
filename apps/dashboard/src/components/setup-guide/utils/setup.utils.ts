import { SetupStep, SetupProgress } from '../types/setup.types';

// Get initial setup steps
export const getInitialSteps = (): SetupStep[] => [
  {
    id: 'monorepo-structure',
    title: 'Monorepo Structure',
    description:
      'Configure your monorepo directory structure and package manager',
    completed: false,
    required: true,
  },
  {
    id: 'package-scanning',
    title: 'Package Scanning',
    description: 'Set up automatic package discovery and dependency analysis',
    completed: false,
    required: true,
  },
  {
    id: 'ci-integration',
    title: 'CI/CD Integration',
    description:
      'Connect with your CI/CD providers (GitHub Actions, GitLab CI, etc.)',
    completed: false,
    required: false,
  },
  {
    id: 'health-checks',
    title: 'Health Monitoring',
    description: 'Configure package health checks and status monitoring',
    completed: false,
    required: false,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Set up alerts and notifications for important events',
    completed: false,
    required: false,
  },
];

// Calculate progress
export const calculateProgress = (
  steps: SetupStep[],
  currentStep: number
): SetupProgress => {
  return {
    currentStep,
    totalSteps: steps.length,
    completedSteps: steps.filter(s => s.completed).length,
  };
};

// Check if user can proceed to next step
export const canProceedToNext = (
  steps: SetupStep[],
  currentStep: number
): boolean => {
  const step = steps[currentStep];
  return !step.required || step.completed;
};

// Check if setup is complete
export const isSetupComplete = (steps: SetupStep[]): boolean => {
  const requiredSteps = steps.filter(s => s.required);
  return requiredSteps.every(s => s.completed);
};

// Mark step as complete
export const markStepAsComplete = (
  steps: SetupStep[],
  stepId: string
): SetupStep[] => {
  return steps.map(step =>
    step.id === stepId ? { ...step, completed: true } : step
  );
};
