import { PackageInfo } from '../../libs/utils/helpers';

export interface CIProvider {
  name: string;
  type: 'github' | 'gitlab' | 'jenkins' | 'circleci' | 'travis' | 'azure' | 'custom';
  baseUrl: string;
  apiToken?: string;
}

export interface CIBuild {
  id: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'cancelled';
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  url: string;
  packageName?: string;
  workflowName?: string;
  jobName?: string;
  steps: CIBuildStep[];
  artifacts?: CIArtifact[];
  coverage?: CICoverage;
  tests?: CITestResults;
}

export interface CIBuildStep {
  name: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  duration: number;
  logs?: string;
  error?: string;
}

export interface CIArtifact {
  name: string;
  type: 'build' | 'test' | 'coverage' | 'documentation';
  size: number;
  url: string;
  expiresAt?: Date;
}

export interface CICoverage {
  percentage: number;
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  uncoveredLines?: number[];
}

export interface CITestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: CITestSuite[];
}

export interface CITestSuite {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  tests: CITest[];
  duration: number;
}

export interface CITest {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  output?: string;
}

export interface CIPackageStatus {
  packageName: string;
  lastBuild?: CIBuild;
  buildHistory: CIBuild[];
  successRate: number;
  averageDuration: number;
  lastCommit: string;
  lastCommitDate: Date;
  branch: string;
  isHealthy: boolean;
  issues: string[];
}

export interface CIMonorepoStatus {
  totalPackages: number;
  healthyPackages: number;
  warningPackages: number;
  errorPackages: number;
  overallHealth: number;
  packages: CIPackageStatus[];
  recentBuilds: CIBuild[];
  failedBuilds: CIBuild[];
  coverage: {
    overall: number;
    packages: Record<string, number>;
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
}

export class CIStatusManager {
  private providers: Map<string, CIProvider> = new Map();
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 2 * 60 * 1000; // 2 minutes

  constructor() {
    this.initializeDefaultProviders();
  }

  /**
   * Initialize default CI providers
   */
  private initializeDefaultProviders(): void {
    // GitHub Actions
    this.addProvider({
      name: 'GitHub Actions',
      type: 'github',
      baseUrl: 'https://api.github.com',
    });

    // GitLab CI
    this.addProvider({
      name: 'GitLab CI',
      type: 'gitlab',
      baseUrl: 'https://gitlab.com/api/v4',
    });

    // CircleCI
    this.addProvider({
      name: 'CircleCI',
      type: 'circleci',
      baseUrl: 'https://circleci.com/api/v2',
    });
  }

  /**
   * Add a CI provider
   */
  addProvider(provider: CIProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Remove a CI provider
   */
  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  /**
   * Get all registered providers
   */
  getProviders(): CIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Fetch CI status for a specific package
   */
  async getPackageStatus(
    packageName: string, 
    providerName?: string
  ): Promise<CIPackageStatus | null> {
    const cacheKey = `package-status-${packageName}-${providerName || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let builds: CIBuild[] = [];

      if (providerName) {
        const provider = this.providers.get(providerName);
        if (provider) {
          builds = await this.fetchBuildsFromProvider(provider, packageName);
        }
      } else {
        // Fetch from all providers
        for (const provider of this.providers.values()) {
          const providerBuilds = await this.fetchBuildsFromProvider(provider, packageName);
          builds.push(...providerBuilds);
        }
      }

      if (builds.length === 0) {
        return null;
      }

      // Sort builds by start time (newest first)
      builds.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      const lastBuild = builds[0];
      const buildHistory = builds.slice(0, 10); // Last 10 builds
      const successRate = this.calculateSuccessRate(builds);
      const averageDuration = this.calculateAverageDuration(builds);
      const isHealthy = this.determinePackageHealth(builds);
      const issues = this.identifyIssues(builds);

      const status: CIPackageStatus = {
        packageName,
        lastBuild,
        buildHistory,
        successRate,
        averageDuration,
        lastCommit: lastBuild.commit,
        lastCommitDate: lastBuild.startTime,
        branch: lastBuild.branch,
        isHealthy,
        issues,
      };

      this.setCache(cacheKey, status);
      return status;

    } catch (error) {
      console.error(`Error fetching CI status for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Get overall monorepo CI status
   */
  async getMonorepoStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus> {
    const cacheKey = 'monorepo-ci-status';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const packageStatuses: CIPackageStatus[] = [];
    const allBuilds: CIBuild[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const packageCoverage: Record<string, number> = {};

    // Get status for each package
    for (const pkg of packages) {
      const status = await this.getPackageStatus(pkg.name);
      if (status) {
        packageStatuses.push(status);
        allBuilds.push(...status.buildHistory);

        // Aggregate test results
        if (status.lastBuild?.tests) {
          totalTests += status.lastBuild.tests.total;
          passedTests += status.lastBuild.tests.passed;
          failedTests += status.lastBuild.tests.failed;
        }

        // Aggregate coverage
        if (status.lastBuild?.coverage) {
          packageCoverage[pkg.name] = status.lastBuild.coverage.percentage;
        }
      }
    }

    // Calculate overall metrics
    const totalPackages = packages.length;
    const healthyPackages = packageStatuses.filter(s => s.isHealthy).length;
    const warningPackages = packageStatuses.filter(s => !s.isHealthy && s.issues.length < 3).length;
    const errorPackages = packageStatuses.filter(s => !s.isHealthy && s.issues.length >= 3).length;
    const overallHealth = (healthyPackages / totalPackages) * 100;

    // Sort builds by time
    allBuilds.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    const recentBuilds = allBuilds.slice(0, 20);
    const failedBuilds = allBuilds.filter(b => b.status === 'failed');

    // Calculate overall coverage
    const coverageValues = Object.values(packageCoverage);
    const overallCoverage = coverageValues.length > 0 
      ? coverageValues.reduce((sum, val) => sum + val, 0) / coverageValues.length 
      : 0;

    const status: CIMonorepoStatus = {
      totalPackages,
      healthyPackages,
      warningPackages,
      errorPackages,
      overallHealth,
      packages: packageStatuses,
      recentBuilds,
      failedBuilds,
      coverage: {
        overall: overallCoverage,
        packages: packageCoverage,
      },
      tests: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
    };

    this.setCache(cacheKey, status);
    return status;
  }

  /**
   * Fetch builds from a specific CI provider
   */
  private async fetchBuildsFromProvider(
    provider: CIProvider, 
    packageName: string
  ): Promise<CIBuild[]> {
    // This is a mock implementation
    // In a real implementation, you would make API calls to the CI provider
    
    const mockBuilds: CIBuild[] = [
      {
        id: `build-${Date.now()}-1`,
        status: 'success',
        branch: 'main',
        commit: 'abc1234',
        commitMessage: `feat: update ${packageName}`,
        author: 'developer@example.com',
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        endTime: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        duration: 5 * 60 * 1000, // 5 minutes
        url: `https://ci.example.com/builds/build-${Date.now()}-1`,
        packageName,
        workflowName: 'Build and Test',
        jobName: 'test',
        steps: [
          {
            name: 'Install dependencies',
            status: 'success',
            duration: 30000,
          },
          {
            name: 'Run tests',
            status: 'success',
            duration: 120000,
          },
          {
            name: 'Build package',
            status: 'success',
            duration: 60000,
          },
        ],
        coverage: {
          percentage: 85,
          lines: 1000,
          functions: 50,
          branches: 200,
          statements: 1200,
        },
        tests: {
          total: 150,
          passed: 145,
          failed: 0,
          skipped: 5,
          duration: 120000,
          suites: [
            {
              name: 'Unit Tests',
              status: 'pass',
              tests: [],
              duration: 80000,
            },
            {
              name: 'Integration Tests',
              status: 'pass',
              tests: [],
              duration: 40000,
            },
          ],
        },
      },
      {
        id: `build-${Date.now()}-2`,
        status: 'failed',
        branch: 'feature/new-feature',
        commit: 'def5678',
        commitMessage: `fix: resolve issue in ${packageName}`,
        author: 'developer@example.com',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        duration: 30 * 60 * 1000, // 30 minutes
        url: `https://ci.example.com/builds/build-${Date.now()}-2`,
        packageName,
        workflowName: 'Build and Test',
        jobName: 'test',
        steps: [
          {
            name: 'Install dependencies',
            status: 'success',
            duration: 30000,
          },
          {
            name: 'Run tests',
            status: 'failed',
            duration: 120000,
            error: 'Test suite failed with 3 failing tests',
          },
        ],
        tests: {
          total: 150,
          passed: 147,
          failed: 3,
          skipped: 0,
          duration: 120000,
          suites: [
            {
              name: 'Unit Tests',
              status: 'pass',
              tests: [],
              duration: 80000,
            },
            {
              name: 'Integration Tests',
              status: 'fail',
              tests: [],
              duration: 40000,
            },
          ],
        },
      },
    ];

    return mockBuilds;
  }

  /**
   * Calculate success rate from builds
   */
  private calculateSuccessRate(builds: CIBuild[]): number {
    if (builds.length === 0) return 0;
    
    const successfulBuilds = builds.filter(b => b.status === 'success').length;
    return (successfulBuilds / builds.length) * 100;
  }

  /**
   * Calculate average build duration
   */
  private calculateAverageDuration(builds: CIBuild[]): number {
    if (builds.length === 0) return 0;
    
    const completedBuilds = builds.filter(b => b.duration !== undefined);
    if (completedBuilds.length === 0) return 0;
    
    const totalDuration = completedBuilds.reduce((sum, b) => sum + (b.duration || 0), 0);
    return totalDuration / completedBuilds.length;
  }

  /**
   * Determine if a package is healthy based on CI results
   */
  private determinePackageHealth(builds: CIBuild[]): boolean {
    if (builds.length === 0) return true;
    
    const recentBuilds = builds.slice(0, 5); // Last 5 builds
    const successRate = this.calculateSuccessRate(recentBuilds);
    
    return successRate >= 80; // 80% success rate threshold
  }

  /**
   * Identify issues from build results
   */
  private identifyIssues(builds: CIBuild[]): string[] {
    const issues: string[] = [];
    
    if (builds.length === 0) return issues;
    
    const recentBuilds = builds.slice(0, 3); // Last 3 builds
    const successRate = this.calculateSuccessRate(recentBuilds);
    
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
    
    // Check for long build times
    const avgDuration = this.calculateAverageDuration(recentBuilds);
    if (avgDuration > 10 * 60 * 1000) { // 10 minutes
      issues.push('Builds are taking longer than expected');
    }
    
    return issues;
  }

  /**
   * Get cache value if not expired
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache value with timestamp
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get build logs for a specific build
   */
  async getBuildLogs(buildId: string, providerName: string): Promise<string> {
    // Mock implementation
    return `Build logs for ${buildId} from ${providerName}\n\nStep 1: Install dependencies\n✓ Dependencies installed successfully\n\nStep 2: Run tests\n✓ All tests passed\n\nStep 3: Build package\n✓ Package built successfully`;
  }

  /**
   * Trigger a new build for a package
   */
  async triggerBuild(
    packageName: string, 
    providerName: string, 
    branch: string = 'main'
  ): Promise<{ success: boolean; buildId?: string; error?: string }> {
    try {
      // Mock implementation
      const buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Triggering build for ${packageName} on ${branch} via ${providerName}`);
      
      return {
        success: true,
        buildId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get build artifacts
   */
  async getBuildArtifacts(buildId: string, providerName: string): Promise<CIArtifact[]> {
    // Mock implementation
    return [
      {
        name: 'coverage-report.html',
        type: 'coverage',
        size: 1024 * 50, // 50KB
        url: `https://ci.example.com/artifacts/${buildId}/coverage-report.html`,
      },
      {
        name: 'test-results.xml',
        type: 'test',
        size: 1024 * 10, // 10KB
        url: `https://ci.example.com/artifacts/${buildId}/test-results.xml`,
      },
    ];
  }
}

// Export default instance
export const ciStatusManager = new CIStatusManager();

// Export convenience functions
export async function getPackageCIStatus(packageName: string): Promise<CIPackageStatus | null> {
  return ciStatusManager.getPackageStatus(packageName);
}

export async function getMonorepoCIStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus> {
  return ciStatusManager.getMonorepoStatus(packages);
}

export async function triggerPackageBuild(
  packageName: string, 
  providerName: string, 
  branch?: string
): Promise<{ success: boolean; buildId?: string; error?: string }> {
  return ciStatusManager.triggerBuild(packageName, providerName, branch);
}