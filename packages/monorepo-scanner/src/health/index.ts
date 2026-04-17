import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import {
  PackageInfo,
  PackageHealth,
  checkOutdatedDependencies,
  calculatePackageHealth,
} from '@monodog/utils/helpers';

export async function checkBuildStatus(
  pkg: PackageInfo
): Promise<PackageHealth['buildStatus']> {
  try {
    if (pkg.scripts && pkg.scripts.build) {
      execSync('npm run build', {
        cwd: pkg.path,
        stdio: 'pipe',
        timeout: 30000,
      });
      return 'success';
    }
    return 'unknown';
  } catch (error) {
    return 'failed';
  }
}

export async function checkTestCoverage(pkg: PackageInfo): Promise<number> {
  try {
    const coveragePaths = [
      path.join(pkg.path, 'coverage', 'coverage-summary.json'),
      path.join(pkg.path, 'coverage', 'lcov.info'),
      path.join(pkg.path, 'coverage', 'clover.xml'),
      path.join(pkg.path, 'coverage.json'),
    ];

    for (const coveragePath of coveragePaths) {
      if (fs.existsSync(coveragePath)) {
        if (coveragePath.endsWith('coverage-summary.json')) {
          try {
            const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
            return (
              coverage.total?.lines?.pct || coverage.total?.statements?.pct || 0
            );
          } catch (error) {
            console.warn(`Error parsing coverage file for ${pkg.name}:`, error);
          }
        }
        return 50;
      }
    }

    if (pkg.scripts && pkg.scripts.test) {
      const hasCoverageSetup =
        pkg.scripts.test.includes('--coverage') ||
        pkg.scripts.test.includes('coverage') ||
        (pkg.devDependencies &&
          (pkg.devDependencies.jest ||
            pkg.devDependencies.nyc ||
            pkg.devDependencies['@types/jest']));

      return hasCoverageSetup ? 30 : 0;
    }

    return 0;
  } catch (error) {
    console.warn(`Error checking coverage for ${pkg.name}:`, error);
    return 0;
  }
}

export async function checkLintStatus(
  pkg: PackageInfo
): Promise<PackageHealth['lintStatus']> {
  try {
    if (pkg.scripts && pkg.scripts.lint) {
      execSync('npm run lint', {
        cwd: pkg.path,
        stdio: 'pipe',
        timeout: 10000,
      });
      return 'pass';
    }
    return 'unknown';
  } catch (error) {
    return 'fail';
  }
}

export async function checkSecurityAudit(
  pkg: PackageInfo
): Promise<PackageHealth['securityAudit']> {
  try {
    const result = execSync('npm audit --json', {
      cwd: pkg.path,
      stdio: 'pipe',
      timeout: 15000,
    });

    const audit = JSON.parse(result.toString());
    return audit.metadata &&
      audit.metadata.vulnerabilities &&
      audit.metadata.vulnerabilities.total === 0
      ? 'pass'
      : 'fail';
  } catch (error) {
    return 'unknown';
  }
}

export async function assessPackageHealth(
  pkg: PackageInfo
): Promise<PackageHealth> {
  const buildStatus = await checkBuildStatus(pkg);
  const testCoverage = await checkTestCoverage(pkg);
  const lintStatus = await checkLintStatus(pkg);
  const securityAudit = await checkSecurityAudit(pkg);

  return calculatePackageHealth(
    buildStatus,
    testCoverage,
    lintStatus,
    securityAudit
  );
}

export function findOutdatedPackages(packages: PackageInfo[]): string[] {
  const outdated: string[] = [];

  for (const pkg of packages) {
    const outdatedDeps = checkOutdatedDependencies(pkg);
    if (outdatedDeps.length > 0) {
      outdated.push(pkg.name);
    }
  }

  return outdated;
}
