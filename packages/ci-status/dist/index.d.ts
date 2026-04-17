import { PackageInfo } from '@monodog/utils/helpers';
import { CIProvider, CIBuild, CIBuildStep, CIArtifact, CICoverage, CITestResults, CITestSuite, CITest, CIPackageStatus, CIMonorepoStatus } from './types';
export { CIProvider, CIBuild, CIBuildStep, CIArtifact, CICoverage, CITestResults, CITestSuite, CITest, CIPackageStatus, CIMonorepoStatus, };
export declare class CIStatusManager {
    private providers;
    private cache;
    constructor();
    private initializeDefaultProviders;
    addProvider(provider: CIProvider): void;
    removeProvider(name: string): void;
    getProviders(): CIProvider[];
    getPackageStatus(packageName: string, providerName?: string): Promise<CIPackageStatus | null>;
    getMonorepoStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus>;
    getBuildLogs(buildId: string, providerName: string): Promise<string>;
    triggerBuild(packageName: string, providerName: string, branch?: string): Promise<{
        success: boolean;
        buildId?: string;
        error?: string;
    }>;
    getBuildArtifacts(buildId: string, providerName: string): Promise<CIArtifact[]>;
}
export declare const ciStatusManager: CIStatusManager;
export declare function getPackageCIStatus(packageName: string): Promise<CIPackageStatus | null>;
export declare function getMonorepoCIStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus>;
export declare function triggerPackageBuild(packageName: string, providerName: string, branch?: string): Promise<{
    success: boolean;
    buildId?: string;
    error?: string;
}>;
