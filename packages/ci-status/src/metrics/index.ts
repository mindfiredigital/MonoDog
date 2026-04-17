import { CIBuild } from '../types';

export function calculateSuccessRate(builds: CIBuild[]): number {
  if (builds.length === 0) return 0;
  const successfulBuilds = builds.filter(b => b.status === 'success').length;
  return (successfulBuilds / builds.length) * 100;
}

export function calculateAverageDuration(builds: CIBuild[]): number {
  if (builds.length === 0) return 0;
  const completedBuilds = builds.filter(b => b.duration !== undefined);
  if (completedBuilds.length === 0) return 0;
  const totalDuration = completedBuilds.reduce(
    (sum, b) => sum + (b.duration || 0),
    0
  );
  return totalDuration / completedBuilds.length;
}

export function determinePackageHealth(builds: CIBuild[]): boolean {
  if (builds.length === 0) return true;
  const recentBuilds = builds.slice(0, 5); // Last 5 builds
  const successRate = calculateSuccessRate(recentBuilds);
  return successRate >= 80;
}

export function identifyIssues(builds: CIBuild[]): string[] {
  const issues: string[] = [];
  if (builds.length === 0) return issues;

  const recentBuilds = builds.slice(0, 3); // Last 3 builds
  const successRate = calculateSuccessRate(recentBuilds);

  if (successRate < 50) {
    issues.push('High failure rate in recent builds');
  }

  const failedBuilds = recentBuilds.filter(b => b.status === 'failed');
  for (const build of failedBuilds) {
    const failedSteps = build.steps.filter(s => s.status === 'failed');
    for (const step of failedSteps) {
      if (step.error) {
        issues.push(`Build step '${step.name}' failed: ${step.error}`);
      }
    }
  }

  const avgDuration = calculateAverageDuration(recentBuilds);
  if (avgDuration > 10 * 60 * 1000) {
    issues.push('Builds are taking longer than expected');
  }

  return issues;
}
