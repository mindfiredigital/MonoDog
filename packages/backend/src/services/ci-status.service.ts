import { getRepositoryInfoFromGit } from '../utils/utilities';
import {
  getWorkflowRuns,
  getJobLogs,
  triggerWorkflow,
} from './github-actions-service';

export const getMonorepoCIStatus = async (
  monorepoRoot: string,
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const { runs } = await getWorkflowRuns(
    repoInfo.owner,
    repoInfo.repo,
    accessToken,
    { per_page: 20 }
  );

  return {
    success: true,
    pipelines: runs,
    total: runs.length,
  };
};

export const getPackageCIStatus = async (
  monorepoRoot: string,
  name: string,
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const { runs } = await getWorkflowRuns(
    repoInfo.owner,
    repoInfo.repo,
    accessToken,
    { per_page: 20 }
  );

  const filteredRuns = runs.filter(run =>
    run.name.toLowerCase().includes(name.toLowerCase())
  );

  return {
    success: true,
    pipelines: filteredRuns,
  };
};

export const triggerCIBuild = async (
  monorepoRoot: string,
  packageName: string,
  providerName = 'github',
  branch = 'main',
  accessToken?: string
) => {
  if (!packageName) throw new Error('Package name is required');
  if (!accessToken) throw new Error('GitHub access token is required');

  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const request = {
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    workflow: 'ci.yml',
    ref: branch,
    inputs: { package: packageName },
  };

  const result = await triggerWorkflow(accessToken, request);

  if (!result.response.success) {
    throw new Error(result.response.message || 'Failed to trigger build');
  }

  return {
    success: true,
    message: `Build triggered for ${packageName}`,
  };
};

export const getBuildLogs = async (
  monorepoRoot: string,
  buildId: string,
  provider = 'github',
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const { logs } = await getJobLogs(
    repoInfo.owner,
    repoInfo.repo,
    Number(buildId),
    accessToken
  );

  return {
    buildId,
    logs,
  };
};

export const getBuildArtifacts = async (
  buildId: string,
  provider = 'github',
  accessToken?: string
) => {
  return {
    buildId,
    artifacts: [],
  };
};
