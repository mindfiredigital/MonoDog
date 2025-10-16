// Browser-compatible monorepo service
// In a real production app, this would make API calls to a backend service

export interface Package {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool' | 'service';
  status: 'healthy' | 'warning' | 'error' | 'building';
  lastUpdated: string;
  dependencies: number;
  maintainers: string[];
  tags: string[];
  description: string;
  path: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependenciesList?: string[];
  devDependenciesList?: string[];
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  outdated?: boolean;
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

class MonorepoService {
  // Simulated monorepo data based on typical monorepo structure
  private mockPackages: Package[] = [
    {
      name: '@monodog/dashboard',
      version: '1.0.0',
      type: 'app',
      status: 'healthy',
      lastUpdated: '2024-01-16',
      dependencies: 12,
      maintainers: ['team-frontend'],
      tags: ['core', 'ui', 'application'],
      description: 'React dashboard for monodog monorepo management',
      path: 'apps/dashboard',
      private: false,
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        test: 'jest',
      },
      dependenciesList: [
        'react',
        'react-dom',
        'react-router-dom',
        '@heroicons/react',
        'recharts',
        'clsx',
        'date-fns',
        'zustand',
      ],
      devDependenciesList: [
        '@types/react',
        '@types/react-dom',
        '@vitejs/plugin-react',
        'typescript',
        'vite',
        'tailwindcss',
      ],
    },
    {
      name: '@monodog/backend',
      version: '1.0.0',
      type: 'service',
      status: 'healthy',
      lastUpdated: '2024-01-16',
      dependencies: 8,
      maintainers: ['team-backend'],
      tags: ['core', 'api', 'service'],
      description: 'Backend API server for monodog monorepo dashboard',
      path: 'packages/backend',
      private: false,
      scripts: {
        dev: 'tsx watch index.ts',
        start: 'tsx index.ts',
        build: 'tsc',
        test: 'jest',
      },
      dependenciesList: ['express', 'cors', 'body-parser', '@prisma/client'],
      devDependenciesList: [
        '@types/express',
        '@types/cors',
        '@types/node',
        'tsx',
        'typescript',
        'prisma',
      ],
    },
    {
      name: '@monodog/utils',
      version: '1.0.0',
      type: 'lib',
      status: 'healthy',
      lastUpdated: '2024-01-16',
      dependencies: 3,
      maintainers: ['team-shared'],
      tags: ['shared', 'utilities', 'library'],
      description: 'Shared utility functions for monodog monorepo dashboard',
      path: 'libs/utils',
      private: false,
      scripts: {
        build: 'tsc',
        test: 'jest',
      },
      dependenciesList: [],
      devDependenciesList: ['@types/node', 'typescript'],
    },
    {
      name: '@monodog/monorepo-scanner',
      version: '0.2.0',
      type: 'tool',
      status: 'warning',
      lastUpdated: '2024-01-15',
      dependencies: 7,
      maintainers: ['team-devops'],
      tags: ['tooling', 'scanner', 'core'],
      description: 'Monorepo package discovery and analysis tool',
      path: 'packages/monorepo-scanner',
      private: false,
      scripts: {
        build: 'tsc',
        test: 'jest',
        scan: 'node dist/index.js',
      },
      dependenciesList: ['chalk', 'commander', 'glob', 'fs-extra'],
      devDependenciesList: ['@types/node', 'typescript', 'jest'],
    },
    {
      name: '@monodog/ci-status',
      version: '0.3.1',
      type: 'tool',
      status: 'healthy',
      lastUpdated: '2024-01-14',
      dependencies: 5,
      maintainers: ['team-devops'],
      tags: ['tooling', 'ci', 'monitoring'],
      description: 'CI/CD status monitoring and reporting tool',
      path: 'packages/ci-status',
      private: false,
      scripts: {
        build: 'tsc',
        test: 'jest',
        start: 'node dist/index.js',
      },
      dependenciesList: ['axios', 'ws', 'dotenv'],
      devDependenciesList: ['@types/node', 'typescript', 'jest'],
    },
  ];

  async getPackages(): Promise<Package[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockPackages];
  }

  async getDependencies(): Promise<DependencyInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const allDeps = new Set<string>();

    this.mockPackages.forEach(pkg => {
      pkg.dependenciesList?.forEach(dep => allDeps.add(dep));
      pkg.devDependenciesList?.forEach(dep => allDeps.add(dep));
    });

    return Array.from(allDeps).map(dep => ({
      name: dep,
      version: 'latest',
      type: 'dependency',
      latest: 'latest',
      outdated: Math.random() > 0.7,
    }));
  }

  async getHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const metrics: HealthMetric[] = [];
    let totalScore = 0;

    // Package count metric
    const packageCount = this.mockPackages.length;
    const packageCountScore = Math.min(100, (packageCount / 10) * 100);
    metrics.push({
      name: 'Package Count',
      value: packageCount,
      status:
        packageCountScore >= 80
          ? 'healthy'
          : packageCountScore >= 60
            ? 'warning'
            : 'error',
      description: `${packageCount} packages in monorepo`,
    });
    totalScore += packageCountScore;

    // Dependency health metric
    const avgDependencies =
      this.mockPackages.reduce((sum, pkg) => sum + pkg.dependencies, 0) /
      this.mockPackages.length;
    const dependencyScore =
      avgDependencies <= 15 ? 100 : avgDependencies <= 25 ? 80 : 60;
    metrics.push({
      name: 'Dependency Health',
      value: Math.round(avgDependencies),
      status:
        dependencyScore >= 80
          ? 'healthy'
          : dependencyScore >= 60
            ? 'warning'
            : 'error',
      description: `Average ${Math.round(avgDependencies)} dependencies per package`,
    });
    totalScore += dependencyScore;

    // Version consistency metric
    const versions = this.mockPackages.map(pkg => pkg.version);
    const uniqueVersions = new Set(versions).size;
    const versionScore =
      uniqueVersions <= 3 ? 100 : uniqueVersions <= 5 ? 80 : 60;
    metrics.push({
      name: 'Version Consistency',
      value: uniqueVersions,
      status:
        versionScore >= 80
          ? 'healthy'
          : versionScore >= 60
            ? 'warning'
            : 'error',
      description: `${uniqueVersions} different versions in use`,
    });
    totalScore += versionScore;

    // Package health analysis
    const packageHealth = this.mockPackages.map(pkg => {
      let score = 100;
      const issues: string[] = [];

      if (!pkg.description || pkg.description === 'No description provided') {
        score -= 20;
        issues.push('Missing description');
      }

      if (pkg.dependencies > 20) {
        score -= 15;
        issues.push('High dependency count');
      }

      if (pkg.private && !pkg.scripts?.build) {
        score -= 10;
        issues.push('Private package without build script');
      }

      return { package: pkg.name, score: Math.max(0, score), issues };
    });

    const overallScore = Math.round(totalScore / metrics.length);

    return {
      overallScore,
      metrics,
      packageHealth,
    };
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

  async getConfigurationFiles(): Promise<ConfigFile[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const configFiles: ConfigFile[] = [
      {
        id: 'config-package.json',
        name: 'package.json',
        path: 'package.json',
        type: 'json',
        content: JSON.stringify(
          {
            name: 'monodog',
            version: '1.0.0',
            description: 'Self-hosted monorepo package manager dashboard',
            private: true,
            workspaces: ['apps/*', 'packages/*', 'libs/*'],
            scripts: {
              dev: 'pnpm --filter @monodog/dashboard dev',
              build: 'pnpm --filter @monodog/dashboard build',
              test: 'pnpm run test --recursive',
            },
          },
          null,
          2
        ),
        lastModified: new Date().toISOString(),
        size: 1024,
        hasSecrets: false,
      },
      {
        id: 'config-pnpm-workspace.yaml',
        name: 'pnpm-workspace.yaml',
        path: 'pnpm-workspace.yaml',
        type: 'yaml',
        content: `packages:
  - 'apps/*'
  - 'packages/*'
  - 'libs/*'`,
        lastModified: new Date().toISOString(),
        size: 64,
        hasSecrets: false,
      },
      {
        id: 'config-turbo.json',
        name: 'turbo.json',
        path: 'turbo.json',
        type: 'json',
        content: JSON.stringify(
          {
            $schema: 'https://turbo.build/schema.json',
            pipeline: {
              build: {
                dependsOn: ['^build'],
                outputs: ['dist/**'],
              },
              test: {
                dependsOn: ['^build'],
              },
              dev: {
                cache: false,
                persistent: true,
              },
            },
          },
          null,
          2
        ),
        lastModified: new Date().toISOString(),
        size: 512,
        hasSecrets: false,
      },
      {
        id: 'config-tsconfig.json',
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        type: 'json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true,
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }],
          },
          null,
          2
        ),
        lastModified: new Date().toISOString(),
        size: 768,
        hasSecrets: false,
      },
      {
        id: 'config-vite.config.ts',
        name: 'vite.config.ts',
        path: 'vite.config.ts',
        type: 'ts',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
        lastModified: new Date().toISOString(),
        size: 256,
        hasSecrets: false,
      },
      {
        id: 'config-tailwind.config.js',
        name: 'tailwind.config.js',
        path: 'tailwind.config.js',
        type: 'js',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        lastModified: new Date().toISOString(),
        size: 192,
        hasSecrets: false,
      },
      {
        id: 'config-env',
        name: '.env.example',
        path: '.env.example',
        type: 'env',
        content: `# Environment variables for monodog
DATABASE_URL=postgresql://username:password@localhost:5432/monodog
JWT_SECRET=your-jwt-secret-key-here
API_KEY=your-api-key-here
GITHUB_TOKEN=ghp_your-github-token-here`,
        lastModified: new Date().toISOString(),
        size: 256,
        hasSecrets: true,
      },
    ];

    return configFiles;
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
