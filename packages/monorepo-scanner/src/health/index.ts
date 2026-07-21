import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import {
  PackageInfo,
  PackageHealth,
  checkOutdatedDependencies,
  calculatePackageHealth,
} from '@mindfiredigital/utils/helpers';

const execAsync = util.promisify(exec);

export async function checkBuildStatus(
  pkg: PackageInfo
): Promise<PackageHealth['buildStatus']> {
  try {
    if (pkg.scripts && pkg.scripts.build) {
      await execAsync('pnpm run build', {
        cwd: pkg.path,
        timeout: 30000,
      });
      return 'success';
    }
    return 'unknown';
  } catch (error) {
    return 'failed';
  }
}

export async function checkTestCoverage(
  pkg: PackageInfo,
  coverageOverridePath?: string
): Promise<number> {
  try {
    const coveragePaths = [
      path.join(pkg.path, 'coverage', 'coverage-summary.json'),
      path.join(pkg.path, 'coverage', 'lcov.info'),
      path.join(pkg.path, 'coverage', 'clover.xml'),
      path.join(pkg.path, 'coverage.json'),
    ];

    if (coverageOverridePath) {
      coveragePaths.unshift(path.join(pkg.path, coverageOverridePath));
    }

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
      await execAsync('pnpm run lint', {
        cwd: pkg.path,
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
    let stdoutData;
    try {
      const { stdout } = await execAsync('pnpm audit --json', {
        cwd: pkg.path,
        timeout: 30000,
      });
      stdoutData = stdout;
    } catch (execError: any) {
      if (execError.stdout) {
        stdoutData = execError.stdout;
      } else {
        throw execError;
      }
    }

    const audit = JSON.parse(stdoutData.toString());

    // Check if metadata.vulnerabilities exists
    if (audit && audit.metadata && audit.metadata.vulnerabilities) {
      const vulns = audit.metadata.vulnerabilities;

      const totalVulns =
        (vulns.low || 0) +
        (vulns.moderate || 0) +
        (vulns.high || 0) +
        (vulns.critical || 0) +
        (vulns.total || 0);

      return totalVulns === 0 ? 'pass' : 'fail';
    }

    return 'unknown';
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

export async function findOutdatedPackages(
  packages: PackageInfo[]
): Promise<string[]> {
  const outdated: string[] = [];

  for (const pkg of packages) {
    const outdatedDeps = await checkOutdatedDependencies(pkg);
    if (outdatedDeps.length > 0) {
      outdated.push(pkg.name);
    }
  }

  return outdated;
}
