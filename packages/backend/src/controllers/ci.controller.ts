import { Request, Response } from 'express';
import {
  getMonorepoCIStatus as getMonorepoCIStatusService,
  getPackageCIStatus as getPackageCIStatusService,
  triggerCIBuild as triggerCIBuildService,
  getBuildLogs as getBuildLogsService,
  getBuildArtifacts as getBuildArtifactsService,
  cancelCIBuild as cancelCIBuildService,
  retryCIBuild as retryCIBuildService,
  togglePipeline as togglePipelineService,
  getAvailableWorkflows as getAvailableWorkflowsService,
} from '../services/ci-status.service';

export const getMonorepoCIStatus = async (req: Request, res: Response) => {
  try {
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;
    const ciStatus = await getMonorepoCIStatusService(rootPath, accessToken);

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
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const status = await getPackageCIStatusService(rootPath, name, accessToken);

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
    const { packageName, providerName, branch, workflowFileName } = req.body;
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await triggerCIBuildService(
      rootPath,
      packageName,
      providerName,
      branch,
      workflowFileName,
      accessToken
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
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await getBuildLogsService(
      rootPath,
      buildId,
      provider as string,
      accessToken
    );

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
    const accessToken = (req as any).accessToken as string | undefined;

    const result = await getBuildArtifactsService(
      buildId,
      provider as string,
      accessToken
    );

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

export const cancelPipeline = async (req: Request, res: Response) => {
  try {
    const { buildId } = req.params;
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await cancelCIBuildService(rootPath, buildId, accessToken);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to cancel pipeline',
    });
  }
};

export const retryPipeline = async (req: Request, res: Response) => {
  try {
    const { buildId } = req.params;
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await retryCIBuildService(rootPath, buildId, accessToken);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to retry pipeline',
    });
  }
};

export const togglePipeline = async (req: Request, res: Response) => {
  try {
    const { pipelineId } = req.params;
    const { active } = req.body;
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await togglePipelineService(
      rootPath,
      pipelineId,
      active,
      accessToken
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to toggle pipeline',
    });
  }
};

export const getAvailableWorkflows = async (req: Request, res: Response) => {
  try {
    const accessToken = (req as any).accessToken as string | undefined;
    const rootPath = req.app.locals.rootPath;

    const result = await getAvailableWorkflowsService(rootPath, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch available workflows',
    });
  }
};
