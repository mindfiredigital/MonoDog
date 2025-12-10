// Browser-compatible monorepo service
// In a real production app, this would make API calls to a backend service
const apiUrl = window.ENV.API_URL ?? 'localhost:8999';

export interface Package {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool' | 'service';
  status: 'healthy' | 'warning' | 'error' | 'building';
  lastUpdated: string;
  dependencies: string[];
  maintainers: string[];
  tags: string[];
  description: string;
  path: string;
  private?: boolean;
  scripts?: Record<string, string>;
  peerDependencies?: string[];
  devDependencies?: string[];
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  outdated?: boolean;
  status: string;
}

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'error';
  description: string;
}

export interface BuildStatus {
  id: string;
  package: string;
  status: 'success' | 'failed' | 'building' | 'queued';
  startTime: string;
  endTime?: string;
  duration?: number;
  stages: BuildStage[];
}

export interface BuildStage {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration?: number;
  logs?: string[];
}

export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  type: 'json' | 'yaml' | 'js' | 'ts' | 'env';
  content: string;
  lastModified: string;
  size: number;
  hasSecrets: boolean;
}

const API_BASE = `http://${apiUrl}/api`;
class MonorepoService {
  // Simulated monorepo data based on typical monorepo structure
  private mockPackages: Package[] = [
    // {
    //   name: '@monodog/dashboard',
    //   version: '1.0.0',
    //   type: 'app',
    //   status: 'healthy',
    //   lastUpdated: '2024-01-16',
    //   dependencies: 12,
    //   maintainers: ['team-frontend'],
    //   tags: ['core', 'ui', 'application'],
    //   description: 'React dashboard for monodog monorepo management',
    //   path: 'apps/dashboard',
    //   private: false,
    //   scripts: {
    //     dev: 'vite',
    //     build: 'tsc && vite build',
    //     preview: 'vite preview',
    //     lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
    //     test: 'jest',
    //   },
    //   dependenciesList: [
    //     'react',
    //     'react-dom',
    //     'react-router-dom',
    //     '@heroicons/react',
    //     'recharts',
    //     'clsx',
    //     'date-fns',
    //     'zustand',
    //   ],
    //   devDependenciesList: [
    //     '@types/react',
    //     '@types/react-dom',
    //     '@vitejs/plugin-react',
    //     'typescript',
    //     'vite',
    //     'tailwindcss',
    //   ],
    // },
    // {
    //   name: '@monodog/backend',
    //   version: '1.0.0',
    //   type: 'service',
    //   status: 'healthy',
    //   lastUpdated: '2024-01-16',
    //   dependencies: 8,
    //   maintainers: ['team-backend'],
    //   tags: ['core', 'api', 'service'],
    //   description: 'Backend API server for monodog monorepo dashboard',
    //   path: 'packages/backend',
    //   private: false,
    //   scripts: {
    //     dev: 'tsx watch index.ts',
    //     start: 'tsx index.ts',
    //     build: 'tsc',
    //     test: 'jest',
    //   },
    //   dependenciesList: ['express', 'cors', 'body-parser', '@prisma/client'],
    //   devDependenciesList: [
    //     '@types/express',
    //     '@types/cors',
    //     '@types/node',
    //     'tsx',
    //     'typescript',
    //     'prisma',
    //   ],
    // },
    // {
    //   name: '@monodog/utils',
    //   version: '1.0.0',
    //   type: 'lib',
    //   status: 'healthy',
    //   lastUpdated: '2024-01-16',
    //   dependencies: 3,
    //   maintainers: ['team-shared'],
    //   tags: ['shared', 'utilities', 'library'],
    //   description: 'Shared utility functions for monodog monorepo dashboard',
    //   path: 'libs/utils',
    //   private: false,
    //   scripts: {
    //     build: 'tsc',
    //     test: 'jest',
    //   },
    //   dependenciesList: [],
    //   devDependenciesList: ['@types/node', 'typescript'],
    // },
    // {
    //   name: '@monodog/monorepo-scanner',
    //   version: '0.2.0',
    //   type: 'tool',
    //   status: 'warning',
    //   lastUpdated: '2024-01-15',
    //   dependencies: 7,
    //   maintainers: ['team-devops'],
    //   tags: ['tooling', 'scanner', 'core'],
    //   description: 'Monorepo package discovery and analysis tool',
    //   path: 'packages/monorepo-scanner',
    //   private: false,
    //   scripts: {
    //     build: 'tsc',
    //     test: 'jest',
    //     scan: 'node dist/index.js',
    //   },
    //   dependenciesList: ['chalk', 'commander', 'glob', 'fs-extra'],
    //   devDependenciesList: ['@types/node', 'typescript', 'jest'],
    // },
    // {
    //   name: '@monodog/ci-status',
    //   version: '0.3.1',
    //   type: 'tool',
    //   status: 'healthy',
    //   lastUpdated: '2024-01-14',
    //   dependencies: 5,
    //   maintainers: ['team-devops'],
    //   tags: ['tooling', 'ci', 'monitoring'],
    //   description: 'CI/CD status monitoring and reporting tool',
    //   path: 'packages/ci-status',
    //   private: false,
    //   scripts: {
    //     build: 'tsc',
    //     test: 'jest',
    //     start: 'node dist/index.js',
    //   },
    //   dependenciesList: ['axios', 'ws', 'dotenv'],
    //   devDependenciesList: ['@types/node', 'typescript', 'jest'],
    // },
  ];

  async getPackages(): Promise<Package[]> {
    try {
      const res = await fetch(`${API_BASE}/packages`);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch package data: HTTP status ${res.status}`
        );
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(
        'Error during getPackages. Attempting to refresh data...',
        error
      );

      const refreshedData = await this.refreshPackages();
      return refreshedData;
    }
  }

  async getPackage(name: string): Promise<Package[]> {
    const res = await fetch(`${API_BASE}/packages/` + encodeURIComponent(name));
    if (!res.ok) {
      throw new Error(
        `Failed to fetch package details for "${name}" (Status: ${res.status})`
      );
    }
    return await res.json();
  }

  async getDependencies(): Promise<DependencyInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const allDeps = new Set<string>();
    try {
      if (!pkg.ok) {
        // Log the failure status before throwing (which will be caught below)
        throw new Error(
          `Failed to fetch package data: HTTP status ${pkg.status}`
        );
      }
      const pkgData = await pkg.json();
      console.log('data from refreshPackage:', pkgData);

      return pkgData;
    } catch (error) {
      console.error('Error fetching package data (refresh):', error);
      return [];
    }
  }

  async refreshPackages(): Promise<Package[]> {
    try {
      const pkg = await fetch(`${API_BASE}/packages/refresh`);

      if (!pkg.ok) {
        // Log the failure status before throwing (which will be caught below)
        throw new Error(
          `Failed to fetch package data: HTTP status ${pkg.status}`
        );
      }
      const pkgData = await pkg.json();
      console.log('data from refreshPackage:', pkgData);

      return pkgData;
    } catch (error) {
      console.error('Error fetching package data (refresh):', error);
      return [];
    }
  }
  // async getHealthStatus(): Promise<{
  //   overallScore: number;
  //   metrics: HealthMetric[];
  //   packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  // }> {
  //   console.log('Fetching health status...');
  //   try {
  //     // Call your real backend API
  //     const healthRes = await fetch(`${API_BASE}/health/packages`);

  //     if (!healthRes.ok) {
  //       throw new Error('Failed to fetch health data');
  //     }

  //     const healthData = await healthRes.json();
  //     console.log('Health data:', healthData);

  //     // Transform the data to match your frontend expectations
  //     return this.transformHealthData(healthData);
  //   } catch (error) {
  //     console.error('Error fetching health data:', error);
  //     // Fallback to the existing mock implementation
  //     return await this.getFallbackHealthStatus();
  //   }
  // }

  async getHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    console.log('getHealthStatus');
    try {
      // First attempt to get health data
      const healthRes = await fetch(`${API_BASE}/health/packages`);
      console.log('Health data from getHealthStatus:', healthRes);
      if (!healthRes.ok) {
        console.log('Health data not available, attempting refresh...');

        // If initial fetch fails, try to refresh the data
        const refreshRes = await fetch(`${API_BASE}/health/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!refreshRes.ok) {
          throw new Error('Failed to refresh health data');
        }

        // Wait a moment for the refresh to complete, then fetch again
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Second attempt to get health data after refresh
        const retryRes = await fetch(`${API_BASE}/health/packages`);

        if (!retryRes.ok) {
          throw new Error('Failed to fetch health data after refresh');
        }

        const healthData = await retryRes.json();
        console.log('Health data after refresh:', healthData);
        return healthData;
        // return this.transformHealthData(healthData);
      }

      const healthData = await healthRes.json();
      console.log('Health data from getHealthStatus:', healthData);
      // return this.transformHealthData(healthData);
      return healthData;
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Fallback to the existing mock implementation
      return await this.getFallbackHealthStatus();
    }
  }

  async refreshHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    try {
      // Call your real backend API
      const healthRes = await fetch(`${API_BASE}/health/refresh`);

      if (!healthRes.ok) {
        throw new Error('Failed to fetch health data');
      }

      const healthData = await healthRes.json();
      console.log('Health data from refreshHealthStatus:', healthData);

      // Transform the data to match your frontend expectations
      // return this.transformHealthData(healthData);
      return healthData;
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Fallback to the existing mock implementation
      return await this.getFallbackHealthStatus();
    }
  }
  // Add this private method for fallback data
  // async getHealthStatus(): Promise<{
  //   overallScore: number;
  //   metrics: HealthMetric[];
  //   packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  // }> {
  //   const healthRes = await fetch(`${API_BASE}/health/packages`);
  //   await new Promise(resolve => setTimeout(resolve, 400));

  //   const metrics: HealthMetric[] = [];
  //   let totalScore = 0;

  //   // Package count metric
  //   const packageCount = this.mockPackages.length;
  //   const packageCountScore = Math.min(100, (packageCount / 10) * 100);
  //   metrics.push({
  //     name: 'Package Count',
  //     value: packageCount,
  //     status:
  //       packageCountScore >= 80
  //         ? 'healthy'
  //         : packageCountScore >= 60
  //           ? 'warning'
  //           : 'error',
  //     description: `${packageCount} packages in monorepo`,
  //   });
  //   totalScore += packageCountScore;

  //   // Dependency health metric
  //   const avgDependencies =
  //     this.mockPackages.reduce((sum, pkg) => sum + pkg.dependencies, 0) /
  //     this.mockPackages.length;
  //   const dependencyScore =
  //     avgDependencies <= 15 ? 100 : avgDependencies <= 25 ? 80 : 60;
  //   metrics.push({
  //     name: 'Dependency Health',
  //     value: Math.round(avgDependencies),
  //     status:
  //       dependencyScore >= 80
  //         ? 'healthy'
  //         : dependencyScore >= 60
  //           ? 'warning'
  //           : 'error',
  //     description: `Average ${Math.round(avgDependencies)} dependencies per package`,
  //   });
  //   totalScore += dependencyScore;

  //   // Version consistency metric
  //   const versions = this.mockPackages.map(pkg => pkg.version);
  //   const uniqueVersions = new Set(versions).size;
  //   const versionScore =
  //     uniqueVersions <= 3 ? 100 : uniqueVersions <= 5 ? 80 : 60;
  //   metrics.push({
  //     name: 'Version Consistency',
  //     value: uniqueVersions,
  //     status:
  //       versionScore >= 80
  //         ? 'healthy'
  //         : versionScore >= 60
  //           ? 'warning'
  //           : 'error',
  //     description: `${uniqueVersions} different versions in use`,
  //   });
  //   totalScore += versionScore;

  //   // Package health analysis
  //   const packageHealth = this.mockPackages.map(pkg => {
  //     let score = 100;
  //     const issues: string[] = [];

  //     if (!pkg.description || pkg.description === 'No description provided') {
  //       score -= 20;
  //       issues.push('Missing description');
  //     }

  //     if (pkg.dependencies > 20) {
  //       score -= 15;
  //       issues.push('High dependency count');
  //     }

  //     if (pkg.private && !pkg.scripts?.build) {
  //       score -= 10;
  //       issues.push('Private package without build script');
  //     }

  //     return { package: pkg.name, score: Math.max(0, score), issues };
  //   });

  //   const overallScore = Math.round(totalScore / metrics.length);

  //   return {
  //     overallScore,
  //     metrics,
  //     packageHealth,
  //   };
  // }
  private async getFallbackHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const metrics: HealthMetric[] = [
      {
        name: 'Package Count',
        value: this.mockPackages.length,
        status: 'healthy',
        description: `${this.mockPackages.length} packages in monorepo`,
      },
      {
        name: 'Dependency Health',
        value: 85,
        status: 'healthy',
        description: 'Dependencies are up to date',
      },
      {
        name: 'Build Status',
        value: 95,
        status: 'healthy',
        description: 'Most builds are successful',
      },
    ];

    const packageHealth = this.mockPackages.map(pkg => ({
      package: pkg.name,
      score: pkg.status === 'healthy' ? 90 : pkg.status === 'warning' ? 70 : 50,
      issues: pkg.status === 'healthy' ? [] : ['Needs attention'],
    }));

    const overallScore = 85;

    return {
      overallScore,
      metrics,
      packageHealth,
    };
  }

  // Add this private transform method
  // private transformHealthData(healthData: any): {
  //   overallScore: number;
  //   metrics: HealthMetric[];
  //   packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  // } {
  //   console.log('-->', healthData);
  //   const overallScore = healthData.summary?.averageScore || 75;

  //   // Create metrics from health data
  //   const metrics: HealthMetric[] = [
  //     {
  //       name: 'Package Health',
  //       value: healthData.summary?.healthy || 0,
  //       status: this.calculateHealthStatus(
  //         healthData.summary?.healthy,
  //         healthData.summary?.total
  //       ),
  //       description: `${healthData.summary?.healthy || 0} healthy packages out of ${healthData.summary?.total || 0}`,
  //     },
  //     {
  //       name: 'Overall Score',
  //       value: Math.round(overallScore),
  //       status:
  //         Math.round(overallScore) >= 80
  //           ? 'healthy'
  //           : Math.round(overallScore) >= 60
  //             ? 'warning'
  //             : 'error',
  //       description: `Average health score: ${Math.round(overallScore)}/100`,
  //     },
  //     {
  //       name: 'Unhealthy Packages',
  //       value: healthData.summary?.unhealthy || 0,
  //       status:
  //         (healthData.summary?.unhealthy || 0) === 0
  //           ? 'healthy'
  //           : (healthData.summary?.unhealthy || 0) <= 2
  //             ? 'warning'
  //             : 'error',
  //       description: `${healthData.summary?.unhealthy || 0} packages need attention`,
  //     },
  //   ];

  //   // Transform package health data
  //   const packageHealth = healthData.packages.map((pkg: any) => ({
  //     package: pkg.packageName,
  //     score: pkg.health?.overallScore || 0,
  //     issues: pkg.error
  //       ? [pkg.error]
  //       : (pkg.health?.overallScore || 0) < 80
  //         ? ['Needs improvement']
  //         : [],
  //   }));

  //   return {
  //     overallScore,
  //     metrics,
  //     packageHealth,
  //   };
  // }

  // Add this helper method (RENAMED to avoid conflict)
  // private calculateHealthStatus(
  //   healthy: number,
  //   total: number
  // ): 'healthy' | 'warning' | 'error' {
  //   if (total === 0) return 'healthy';
  //   const ratio = healthy / total;
  //   if (ratio >= 0.8) return 'healthy';
  //   if (ratio >= 0.6) return 'warning';
  //   return 'error';
  // }

  // Add this method to your MonorepoService class
  async updatePackageConfiguration(
    packageName: string,
    config: string,
    packagePath: string
  ): Promise<{
    success: boolean;
    message: string;
    package: any;
    healthRefreshed?: boolean;
    preservedFields?: boolean;
  }> {
    try {
      console.log(
        '📤 Updating package configuration via MonorepoService:',
        packageName
      );

      const response = await fetch(`${API_BASE}/packages/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageName,
          config,
          packagePath,
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📥 Error response:', errorText);

        let errorMessage = `HTTP error ${response.status}`;
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('📥 Success response:', result);

      return result;
    } catch (error) {
      console.error('❌ Error updating package configuration:', error);
      throw error;
    }
  }

  async getBuildStatus(): Promise<BuildStatus[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const builds: BuildStatus[] = [];

    for (const pkg of this.mockPackages) {
      const hasBuildScript = pkg.scripts && pkg.scripts.build;
      const hasTestScript = pkg.scripts && pkg.scripts.test;

      if (hasBuildScript || hasTestScript) {
        const startTime = new Date(
          Date.now() - Math.random() * 86400000
        ).toISOString();
        const status: 'success' | 'failed' | 'building' | 'queued' =
          Math.random() > 0.8
            ? 'failed'
            : Math.random() > 0.6
              ? 'building'
              : Math.random() > 0.4
                ? 'queued'
                : 'success';

        builds.push({
          id: `build-${pkg.name}-${Date.now()}`,
          package: pkg.name,
          status,
          startTime,
          endTime:
            status !== 'building'
              ? new Date(Date.now() - Math.random() * 3600000).toISOString()
              : undefined,
          duration:
            status !== 'building'
              ? Math.floor(Math.random() * 300) + 60
              : undefined,
          stages: this.generateBuildStages(pkg, status),
        });
      }
    }

    return builds;
  }

  //   async getConfigurationFiles(): Promise<ConfigFile[]> {
  //     await new Promise(resolve => setTimeout(resolve, 300));

  //     const configFiles: ConfigFile[] = [
  //       {
  //         id: 'config-package.json',
  //         name: 'package.json',
  //         path: 'package.json',
  //         type: 'json',
  //         content: JSON.stringify(
  //           {
  //             name: 'monodog',
  //             version: '1.0.0',
  //             description: 'Self-hosted monorepo package manager dashboard',
  //             private: true,
  //             workspaces: ['apps/*', 'packages/*', 'libs/*'],
  //             scripts: {
  //               dev: 'pnpm --filter @monodog/dashboard dev',
  //               build: 'pnpm --filter @monodog/dashboard build',
  //               test: 'pnpm run test --recursive',
  //             },
  //           },
  //           null,
  //           2
  //         ),
  //         lastModified: new Date().toISOString(),
  //         size: 1024,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-pnpm-workspace.yaml',
  //         name: 'pnpm-workspace.yaml',
  //         path: 'pnpm-workspace.yaml',
  //         type: 'yaml',
  //         content: `packages:
  //   - 'apps/*'
  //   - 'packages/*'
  //   - 'libs/*'`,
  //         lastModified: new Date().toISOString(),
  //         size: 64,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-turbo.json',
  //         name: 'turbo.json',
  //         path: 'turbo.json',
  //         type: 'json',
  //         content: JSON.stringify(
  //           {
  //             $schema: 'https://turbo.build/schema.json',
  //             pipeline: {
  //               build: {
  //                 dependsOn: ['^build'],
  //                 outputs: ['dist/**'],
  //               },
  //               test: {
  //                 dependsOn: ['^build'],
  //               },
  //               dev: {
  //                 cache: false,
  //                 persistent: true,
  //               },
  //             },
  //           },
  //           null,
  //           2
  //         ),
  //         lastModified: new Date().toISOString(),
  //         size: 512,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-tsconfig.json',
  //         name: 'tsconfig.json',
  //         path: 'tsconfig.json',
  //         type: 'json',
  //         content: JSON.stringify(
  //           {
  //             compilerOptions: {
  //               target: 'ES2020',
  //               useDefineForClassFields: true,
  //               lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  //               module: 'ESNext',
  //               skipLibCheck: true,
  //               moduleResolution: 'bundler',
  //               allowImportingTsExtensions: true,
  //               resolveJsonModule: true,
  //               isolatedModules: true,
  //               noEmit: true,
  //               jsx: 'react-jsx',
  //               strict: true,
  //               noUnusedLocals: true,
  //               noUnusedParameters: true,
  //               noFallthroughCasesInSwitch: true,
  //             },
  //             include: ['src'],
  //             references: [{ path: './tsconfig.node.json' }],
  //           },
  //           null,
  //           2
  //         ),
  //         lastModified: new Date().toISOString(),
  //         size: 768,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-vite.config.ts',
  //         name: 'vite.config.ts',
  //         path: 'vite.config.ts',
  //         type: 'ts',
  //         content: `import { defineConfig } from 'vite';
  // import react from '@vitejs/plugin-react';

  // export default defineConfig({
  //   plugins: [react()],
  // });`,
  //         lastModified: new Date().toISOString(),
  //         size: 256,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-tailwind.config.js',
  //         name: 'tailwind.config.js',
  //         path: 'tailwind.config.js',
  //         type: 'js',
  //         content: `/** @type {import('tailwindcss').Config} */
  // export default {
  //   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  //   theme: {
  //     extend: {},
  //   },
  //   plugins: [],
  // }`,
  //         lastModified: new Date().toISOString(),
  //         size: 192,
  //         hasSecrets: false,
  //       },
  //       {
  //         id: 'config-env',
  //         name: '.env.example',
  //         path: '.env.example',
  //         type: 'env',
  //         content: `# Environment variables for monodog
  // DATABASE_URL=postgresql://username:password@localhost:5432/monodog
  // JWT_SECRET=your-jwt-secret-key-here
  // API_KEY=your-api-key-here
  // GITHUB_TOKEN=ghp_your-github-token-here`,
  //         lastModified: new Date().toISOString(),
  //         size: 256,
  //         hasSecrets: true,
  //       },
  //     ];

  //     return configFiles;
  //   }

  async getConfigurationFiles(): Promise<ConfigFile[]> {
    try {
      console.log('Fetching configuration files from backend...');

      // Call your real backend API
      const res = await fetch(`${API_BASE}/config/files`);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch config files: ${res.status} ${res.statusText}`
        );
      }

      const response = await res.json();

      console.log('Response from config files API:', response);

      if (response.success && response.files) {
        console.log(
          `Successfully fetched ${response.files.length} configuration files`
        );
        return response.files;
      } else {
        throw new Error('Invalid response format from config files API');
      }
    } catch (error) {
      console.error('Error fetching configuration files from backend:', error);

      // Fallback to mock data if backend call fails
      console.log('Falling back to mock configuration files...');
      // return await this.getMockConfigurationFiles();
    }
  }

  async saveConfigurationFile(
    fileId: string,
    content: string
  ): Promise<ConfigFile> {
    try {
      console.log('Saving configuration file:', fileId);

      const res = await fetch(
        `${API_BASE}/config/files/${encodeURIComponent(fileId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            `Failed to save file: ${res.status} ${res.statusText}`
        );
      }

      const response = await res.json();

      if (response.success && response.file) {
        console.log('File saved successfully:', fileId);
        return response.file;
      } else {
        throw new Error('Invalid response format from save file API');
      }
    } catch (error) {
      console.error('Error saving configuration file:', error);
      throw error; // Re-throw to let the component handle it
    }
  }

  private generateBuildStages(pkg: Package, status: string): BuildStage[] {
    const stages: BuildStage[] = [
      {
        name: 'Install',
        status: 'success',
        duration: Math.floor(Math.random() * 30) + 10,
        logs: [
          'Installing dependencies...',
          'Dependencies installed successfully',
        ],
      },
      {
        name: 'Lint',
        status:
          status === 'failed' && Math.random() > 0.7 ? 'failed' : 'success',
        duration: Math.floor(Math.random() * 20) + 5,
        logs: ['Running ESLint...', 'Linting completed'],
      },
      {
        name: 'Test',
        status:
          status === 'failed' && Math.random() > 0.5 ? 'failed' : 'success',
        duration: Math.floor(Math.random() * 60) + 30,
        logs: ['Running tests...', 'Test suite completed'],
      },
      {
        name: 'Build',
        status: status === 'failed' ? 'failed' : 'success',
        duration: Math.floor(Math.random() * 120) + 60,
        logs: ['Building package...', 'Build completed successfully'],
      },
    ];

    if (status === 'building') {
      const buildingStage = Math.floor(Math.random() * stages.length);
      stages[buildingStage].status = 'running';
      stages
        .slice(buildingStage + 1)
        .forEach(stage => (stage.status = 'pending'));
    }

    return stages;
  }
}

export const monorepoService = new MonorepoService();
