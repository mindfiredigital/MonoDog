/**
 * Health related types
 */

export interface PackageHealth {
  buildStatus: 'success' | 'failed' | 'running' | 'unknown';
  testCoverage: number;
  lintStatus: 'pass' | 'fail' | 'unknown';
  securityAudit: 'pass' | 'fail' | 'unknown';
  overallScore: number;
}

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'error';
  description: string;
}
