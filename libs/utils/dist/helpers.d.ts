export interface PackageInfo {
    name: string;
    version: string;
    type: string;
    path: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
    scripts: Record<string, string>;
    maintainers: string[];
    description?: string;
    license?: string;
    repository?: Record<string, string>;
}
export interface DependencyInfo {
    name: string;
    version: string;
    type: 'dependency' | 'devDependency' | 'peerDependency';
    latest?: string;
    status?: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
    outdated?: boolean;
}
export interface PackageHealth {
    buildStatus: 'success' | 'failed' | 'running' | 'unknown';
    testCoverage: number;
    lintStatus: 'pass' | 'fail' | 'unknown';
    securityAudit: 'pass' | 'fail' | 'unknown';
    overallScore: number;
}
export interface MonorepoStats {
    totalPackages: number;
    apps: number;
    libraries: number;
    tools: number;
    healthyPackages: number;
    warningPackages: number;
    errorPackages: number;
    outdatedDependencies: number;
    totalDependencies: number;
}
/**
 * Scans the monorepo and returns information about all packages
 */
declare function scanMonorepo(rootDir: string): PackageInfo[];
/**
 * Analyzes dependencies and determines their status
 */
/**
 * Calculates package health score based on various metrics
 */
declare function calculatePackageHealth(buildStatus: PackageHealth['buildStatus'], testCoverage: number, lintStatus: PackageHealth['lintStatus'], securityAudit: PackageHealth['securityAudit']): PackageHealth;
/**
 * Generates comprehensive monorepo statistics
 */
declare function generateMonorepoStats(packages: PackageInfo[]): MonorepoStats;
/**
 * Finds circular dependencies in the monorepo
 */
declare function findCircularDependencies(packages: PackageInfo[]): string[][];
/**
 * Generates a dependency graph for visualization
 */
declare function generateDependencyGraph(packages: PackageInfo[]): {
    nodes: {
        label: string;
        type: string;
        version: string;
        dependencies: number;
    }[];
    edges: {
        from: string;
        to: string;
        type: string;
    }[];
};
/**
 * Checks if a package has outdated dependencies
 */
declare function checkOutdatedDependencies(packageInfo: PackageInfo): DependencyInfo[];
/**
 * Formats version numbers for comparison
 */
/**
 * Compares two version strings
 */
/**
 * Gets package size information
 */
declare function getPackageSize(packagePath: string): {
    size: number;
    files: number;
};
export { scanMonorepo, generateMonorepoStats, findCircularDependencies, generateDependencyGraph, checkOutdatedDependencies, getPackageSize, calculatePackageHealth, };
