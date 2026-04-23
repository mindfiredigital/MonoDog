import { CIProvider, CIBuild, CIArtifact } from '../types';

export async function fetchBuildsFromProvider(
  _provider: CIProvider,
  packageName: string
): Promise<CIBuild[]> {
  const mockBuilds: CIBuild[] = [
    {
      id: `build-${Date.now()}-1`,
      status: 'success',
      branch: 'main',
      commit: 'abc1234',
      commitMessage: `feat: update ${packageName}`,
      author: 'developer@example.com',
      startTime: new Date(Date.now() - 1000 * 60 * 30),
      endTime: new Date(Date.now() - 1000 * 60 * 25),
      duration: 5 * 60 * 1000,
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
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      duration: 30 * 60 * 1000,
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

export async function getBuildLogs(
  buildId: string,
  providerName: string
): Promise<string> {
  return `Build logs for ${buildId} from ${providerName}\n\nStep 1: Install dependencies\n✓ Dependencies installed successfully\n\nStep 2: Run tests\n✓ All tests passed\n\nStep 3: Build package\n✓ Package built successfully`;
}

export async function triggerBuild(
  packageName: string,
  providerName: string,
  branch: string = 'main'
): Promise<{ success: boolean; buildId?: string; error?: string }> {
  try {
    const buildId = `build-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(
      `Triggering build for ${packageName} on ${branch} via ${providerName}`
    );

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

export async function getBuildArtifacts(
  buildId: string,
  _providerName: string
): Promise<CIArtifact[]> {
  return [
    {
      name: 'coverage-report.html',
      type: 'coverage',
      size: 1024 * 50,
      url: `https://ci.example.com/artifacts/${buildId}/coverage-report.html`,
    },
    {
      name: 'test-results.xml',
      type: 'test',
      size: 1024 * 10,
      url: `https://ci.example.com/artifacts/${buildId}/test-results.xml`,
    },
  ];
}
