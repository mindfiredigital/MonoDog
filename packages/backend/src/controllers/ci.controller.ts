import { Request, Response } from 'express';
import {
  getMonorepoCIStatus as getMonorepoCIStatusService,
  getPackageCIStatus as getPackageCIStatusService,
  triggerCIBuild as triggerCIBuildService,
  getBuildLogs as getBuildLogsService,
  getBuildArtifacts as getBuildArtifactsService,
} from '../services/ci-status.service';

export const getMonorepoCIStatus = async (req: Request, res: Response) => {
  try {
    const ciStatus = await getMonorepoCIStatusService();

    res.json(ciStatus);
  } catch (error) {
    console.error('Failed to fetch monorepo CI status:', error);

    res.status(500).json({
      error: 'Failed to fetch CI status',
    });
  }
};

export const getPackageCIStatus = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const status = await getPackageCIStatusService(name);

    res.json(status);
  } catch (error) {
    res
      .status(
        error instanceof Error &&
          error.message === 'Package CI status not found'
          ? 404
          : 500
      )
      .json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch package CI status',
      });
  }
};

export const triggerCIBuild = async (req: Request, res: Response) => {
  try {
    const { packageName, providerName, branch } = req.body;

    const result = await triggerCIBuildService(
      packageName,
      providerName,
      branch
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger build',
    });
  }
};

export const getBuildLogs = async (req: Request, res: Response) => {
  try {
    const { buildId } = req.params;
    const { provider } = req.query;

    const result = await getBuildLogsService(buildId, provider as string);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : 'Failed to fetch build logs',
    });
  }
};

export const getBuildArtifacts = async (req: Request, res: Response) => {
  try {
    const { buildId } = req.params;
    const { provider } = req.query;

    const result = await getBuildArtifactsService(buildId, provider as string);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch build artifacts',
    });
  }
};
