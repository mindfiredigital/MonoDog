export interface PackageHealth {
  buildStatus: 'success' | 'failed' | 'running' | 'unknown';
  testCoverage: number;
  lintStatus: 'pass' | 'fail' | 'unknown';
  securityAudit: 'pass' | 'fail' | 'unknown';
  overallScore: number;
}

/**
 * Calculates package health score based on various metrics
 */
function calculatePackageHealth(
  buildStatus: PackageHealth['buildStatus'],
  testCoverage: number,
  lintStatus: PackageHealth['lintStatus'],
  securityAudit: PackageHealth['securityAudit']
): PackageHealth {
  let score = 0;

  // Build status (30 points)
  switch (buildStatus) {
    case 'success':
      score += 30;
      break;
    case 'running':
      score += 15;
      break;
    case 'failed':
      score += 0;
      break;
    default:
      score += 10;
  }

  // Test coverage (25 points)
  score += Math.min(25, (testCoverage / 100) * 25);

  // Lint status (25 points)
  switch (lintStatus) {
    case 'pass':
      score += 25;
      break;
    case 'fail':
      score += 0;
      break;
    default:
      score += 10;
  }

  // Security audit (20 points)
  switch (securityAudit) {
    case 'pass':
      score += 20;
      break;
    case 'fail':
      score += 0;
      break;
    default:
      score += 10;
  }

  return {
    buildStatus,
    testCoverage,
    lintStatus,
    securityAudit,
    overallScore: Math.round(score),
  };
}

export {
  calculatePackageHealth,
};
