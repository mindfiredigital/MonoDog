import type { Request, Response } from 'express';
import * as pipelineService from '../services/pipeline-service';
import {
  getWorkflowRun,
  getWorkflowRunJobs,
  getWorkflowRuns,
} from '../services/github-actions-service';
import {
  extractErrorMessage,
  VALIDATION_ERRORS,
} from '../constants/error-messages';
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '../constants/http';
import { AppLogger } from '../middleware/logger';
import { PipelineRecord } from '../types/pipeline';

function selectBestRun(
  pipeline: PipelineRecord,
  runs: Array<{
    id: number;
    created_at: string;
    updated_at: string;
    run_attempt: number;
    status: string;
    conclusion: string | null;
  }>
) {
  const triggeredAt = new Date(pipeline.triggeredAt).getTime();
  const matchingRuns = runs
    .filter(run => {
      if (pipeline.lastRunId && String(run.id) === String(pipeline.lastRunId)) {
        return true;
      }

      const createdAt = new Date(run.created_at).getTime();
      return createdAt >= triggeredAt - 5 * 60 * 1000;
    })
    .sort((a, b) => {
      const aScore = new Date(a.created_at).getTime();
      const bScore = new Date(b.created_at).getTime();
      return bScore - aScore || b.run_attempt - a.run_attempt;
    });

  return matchingRuns[0] || runs[0] || null;
}

async function enrichPipeline(
  pipeline: PipelineRecord,
  accessToken?: string
): Promise<Record<string, unknown>> {
  const basePipeline = {
    ...pipeline,
    workflowRuns: [],
    lastRun: null,
    jobs: [],
  };

  if (!accessToken) {
    return basePipeline;
  }

  try {
    const { runs, rateLimit } = await getWorkflowRuns(
      pipeline.owner,
      pipeline.repo,
      accessToken,
      {
        workflowId: pipeline.workflowId,
        workflowPath: pipeline.workflowPath || undefined,
        page: 1,
        per_page: 10,
      }
    );

    const matchedRun = selectBestRun(pipeline, runs);

    let jobs: unknown[] = [];
    if (matchedRun) {
      const jobsResponse = await getWorkflowRunJobs(
        pipeline.owner,
        pipeline.repo,
        matchedRun.id,
        accessToken,
        1,
        100
      );
      jobs = jobsResponse.jobs;

      await pipelineService.updatePipelineStatus(
        pipeline.id,
        matchedRun.status,
        matchedRun.conclusion,
        String(matchedRun.id)
      );
    }

    return {
      ...basePipeline,
      currentStatus: matchedRun?.status || pipeline.currentStatus,
      currentConclusion: matchedRun?.conclusion ?? pipeline.currentConclusion,
      lastRunId: matchedRun ? String(matchedRun.id) : pipeline.lastRunId,
      lastRun: matchedRun,
      workflowRuns: runs,
      jobs,
      rateLimit,
    };
  } catch (error) {
    AppLogger.warn(
      `Failed to enrich pipeline ${pipeline.id} with GitHub data: ${extractErrorMessage(error)}`
    );
    return basePipeline;
  }
}

export async function getRecentPipelines(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const accessToken = (req as any).accessToken as string | undefined;

    const pipelines = (await pipelineService.getRecentPipelines(
      limit,
      offset
    )) as PipelineRecord[];

    const enrichedPipelines = await Promise.all(
      pipelines.map(pipeline => enrichPipeline(pipeline, accessToken))
    );

    res.json({
      success: true,
      pipelines: enrichedPipelines,
      total: enrichedPipelines.length,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch recent pipelines',
      message: extractErrorMessage(error),
    });
  }
}

export async function getPipelineAuditLogs(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);

    const logs = await pipelineService.getPipelineAuditLogs(
      pipelineId,
      limit,
      offset
    );

    res.json({
      success: true,
      logs: logs.map(log => ({
        ...log,
        details:
          typeof log.details === 'string'
            ? JSON.parse(log.details)
            : log.details,
      })),
      total: logs.length,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch pipeline audit logs',
      message: extractErrorMessage(error),
    });
  }
}

export async function updatePipelineStatus(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;
    const { currentStatus, currentConclusion, lastRunId } = req.body ?? {};

    if (!currentStatus) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.CURRENT_STATUS_REQUIRED,
      });
      return;
    }

    const result = await pipelineService.updatePipelineStatus(
      pipelineId,
      currentStatus,
      currentConclusion ?? null,
      lastRunId
    );

    res.json({
      success: true,
      pipeline: result,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update pipeline status',
      message: extractErrorMessage(error),
    });
  }
}

export async function getPipelineDetails(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;
    const accessToken = (req as any).accessToken as string | undefined;
    const pipeline = (await pipelineService.getPipelineById(
      pipelineId
    )) as PipelineRecord | null;

    if (!pipeline) {
      res.status(404).json({
        success: false,
        error: 'Pipeline not found',
      });
      return;
    }

    const enrichedPipeline = await enrichPipeline(pipeline, accessToken);
    res.json({
      success: true,
      pipeline: enrichedPipeline,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch pipeline details',
      message: extractErrorMessage(error),
    });
  }
}

export async function refreshPipelineFromRun(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;
    const accessToken = (req as any).accessToken as string | undefined;
    const pipeline = (await pipelineService.getPipelineById(
      pipelineId
    )) as PipelineRecord | null;

    if (!pipeline) {
      res.status(404).json({
        success: false,
        error: 'Pipeline not found',
      });
      return;
    }

    if (!accessToken || !pipeline.lastRunId) {
      res.json({
        success: true,
        pipeline,
      });
      return;
    }

    const { run } = await getWorkflowRun(
      pipeline.owner,
      pipeline.repo,
      Number(pipeline.lastRunId),
      accessToken
    );

    await pipelineService.updatePipelineStatus(
      pipelineId,
      run.status,
      run.conclusion,
      String(run.id)
    );

    const jobsResponse = await getWorkflowRunJobs(
      pipeline.owner,
      pipeline.repo,
      run.id,
      accessToken,
      1,
      100
    );

    res.json({
      success: true,
      pipeline: {
        ...pipeline,
        currentStatus: run.status,
        currentConclusion: run.conclusion,
        lastRunId: String(run.id),
        lastRun: run,
        jobs: jobsResponse.jobs,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to refresh pipeline status',
      message: extractErrorMessage(error),
    });
  }
}
