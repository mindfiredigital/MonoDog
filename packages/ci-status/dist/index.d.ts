import { PackageInfo } from '@monodog/utils/helpers';
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
export declare class CIStatusManager {
    private providers;
    private cache;
    private cacheExpiry;
    constructor();
    /**
     * Initialize default CI providers
     */
    private initializeDefaultProviders;
    /**
     * Add a CI provider
     */
    addProvider(provider: CIProvider): void;
    /**
     * Remove a CI provider
     */
    removeProvider(name: string): void;
    /**
     * Get all registered providers
     */
    getProviders(): CIProvider[];
    /**
     * Fetch CI status for a specific package
     */
    getPackageStatus(packageName: string, providerName?: string): Promise<CIPackageStatus | null>;
    /**
     * Get overall monorepo CI status
     */
    getMonorepoStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus>;
    /**
     * Fetch builds from a specific CI provider
     */
    private fetchBuildsFromProvider;
    /**
     * Calculate success rate from builds
     */
    private calculateSuccessRate;
    /**
     * Calculate average build duration
     */
    private calculateAverageDuration;
    /**
     * Determine if a package is healthy based on CI results
     */
    private determinePackageHealth;
    /**
     * Identify issues from build results
     */
    private identifyIssues;
    /**
     * Get cache value if not expired
     */
    private getFromCache;
    /**
     * Set cache value with timestamp
     */
    private setCache;
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Get build logs for a specific build
     */
    getBuildLogs(buildId: string, providerName: string): Promise<string>;
    /**
     * Trigger a new build for a package
     */
    triggerBuild(packageName: string, providerName: string, branch?: string): Promise<{
        success: boolean;
        buildId?: string;
        error?: string;
    }>;
    /**
     * Get build artifacts
     */
    getBuildArtifacts(buildId: string, _providerName: string): Promise<CIArtifact[]>;
}
export declare const ciStatusManager: CIStatusManager;
export declare function getPackageCIStatus(packageName: string): Promise<CIPackageStatus | null>;
export declare function getMonorepoCIStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus>;
export declare function triggerPackageBuild(packageName: string, providerName: string, branch?: string): Promise<{
    success: boolean;
    buildId?: string;
    error?: string;
}>;
