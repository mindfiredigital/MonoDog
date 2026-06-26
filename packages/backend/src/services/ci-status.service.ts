import { getRepositoryInfoFromGit } from '../utils/utilities';
import {
  getWorkflowRuns,
  getJobLogs,
  triggerWorkflow,
  cancelWorkflowRun,
  rerunWorkflow,
  enableWorkflow,
  disableWorkflow,
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

export const cancelCIBuild = async (
  monorepoRoot: string,
  buildId: string,
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const result = await cancelWorkflowRun(
    repoInfo.owner,
    repoInfo.repo,
    Number(buildId),
    accessToken
  );
  if (!result.success) throw new Error('Failed to cancel build via GitHub API');

  return { success: true, message: `Build ${buildId} cancelled successfully` };
};

export const retryCIBuild = async (
  monorepoRoot: string,
  buildId: string,
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const result = await rerunWorkflow(
    repoInfo.owner,
    repoInfo.repo,
    Number(buildId),
    accessToken
  );
  if (!result.success) throw new Error('Failed to retry build via GitHub API');

  return { success: true, message: `Build ${buildId} retried successfully` };
};

export const togglePipeline = async (
  monorepoRoot: string,
  pipelineId: string,
  active: boolean,
  accessToken?: string
) => {
  if (!accessToken) throw new Error('GitHub access token is required');
  const repoInfo = await getRepositoryInfoFromGit(monorepoRoot);
  if (!repoInfo) throw new Error('Could not determine GitHub repository info');

  const result = active
    ? await enableWorkflow(
        repoInfo.owner,
        repoInfo.repo,
        pipelineId,
        accessToken
      )
    : await disableWorkflow(
        repoInfo.owner,
        repoInfo.repo,
        pipelineId,
        accessToken
      );

  if (!result.success)
    throw new Error(
      `Failed to ${active ? 'enable' : 'disable'} pipeline via GitHub API`
    );

  return {
    success: true,
    message: `Pipeline ${pipelineId} is now ${active ? 'active' : 'inactive'}`,
  };
};
