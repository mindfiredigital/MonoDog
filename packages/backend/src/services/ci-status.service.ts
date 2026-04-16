import { scanMonorepo } from '@monodog/utils/helpers';
import {
  ciStatusManager,
  getMonorepoCIStatus as getMonorepoCIStatusCore,
} from '@monodog/ci-status';

export const getMonorepoCIStatus = async () => {
  const packages = scanMonorepo(process.cwd());
  return await getMonorepoCIStatusCore(packages);
};

export const getPackageCIStatus = async (name: string) => {
  const status = await ciStatusManager.getPackageStatus(name);

  if (!status) {
    throw new Error('Package CI status not found');
  }

  return status;
};

export const triggerCIBuild = async (
  packageName: string,
  providerName = 'github',
  branch = 'main'
) => {
  if (!packageName) {
    throw new Error('Package name is required');
  }

  const result = await ciStatusManager.triggerBuild(
    packageName,
    providerName,
    branch
  );

  if (!result.success) {
    throw new Error(result.error || 'Failed to trigger build');
  }

  return {
    success: true,
    buildId: result.buildId,
    message: `Build triggered for ${packageName}`,
  };
};

export const getBuildLogs = async (buildId: string, provider: string) => {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const logs = await ciStatusManager.getBuildLogs(buildId, provider);

  return {
    buildId,
    logs,
  };
};

export const getBuildArtifacts = async (buildId: string, provider: string) => {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const artifacts = await ciStatusManager.getBuildArtifacts(buildId, provider);

  return {
    buildId,
    artifacts,
  };
};
