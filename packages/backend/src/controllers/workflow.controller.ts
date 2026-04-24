import type { Request, Response } from 'express';
import {
  buildJobLogsResponse,
  cancelWorkflowRun,
  getJobLogs,
  getWorkflowRun,
  getWorkflowRunJobs,
  getWorkflowRuns,
  listWorkflows,
  rerunWorkflow,
  triggerWorkflow,
} from '../services/github-actions-service';
import * as pipelineService from '../services/pipeline-service';
import { extractErrorMessage } from '../constants/error-messages';
import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from '../constants/http';

async function createAuditLogIfNeeded(
  req: Request,
  action: 'trigger' | 'cancel' | 'rerun' | 'view_logs',
  resourceType: 'workflow_run' | 'job' | 'pipeline',
  resourceId: string,
  resourceName: string,
  details: Record<string, unknown>
) {
  const pipelineId =
    (req.query.pipelineId as string | undefined) ||
    (req.body?.pipelineId as string | undefined);

  if (!pipelineId) {
    return;
  }

  const user = (req as any).user;
  await pipelineService.createAuditLog(
    pipelineId,
    Number(user?.id || 0),
    user?.login || 'unknown',
    action,
    resourceType,
    resourceId,
    resourceName,
    details,
    'success'
  );
}

export async function getAvailableWorkflows(req: Request, res: Response) {
  try {
    const { owner, repo } = req.params;
    const accessToken = (req as any).accessToken as string;
    const result = await listWorkflows(owner, repo, accessToken);

    res.json({
      success: true,
      workflows: result.workflows,
      rateLimit: result.rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch workflows',
      message: extractErrorMessage(error),
    });
  }
}

export async function getRepositoryWorkflowRuns(req: Request, res: Response) {
  try {
    const { owner, repo } = req.params;
    const accessToken = (req as any).accessToken as string;
    const result = await getWorkflowRuns(owner, repo, accessToken, {
      workflowId: req.query.workflowId as string | undefined,
      workflowPath: req.query.workflowPath as string | undefined,
      status: req.query.status as string | undefined,
      conclusion: req.query.conclusion as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
    });

    res.json({
      success: true,
      runs: result.runs,
      totalCount: result.totalCount,
      rateLimit: result.rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch workflow runs',
      message: extractErrorMessage(error),
    });
  }
}

export async function getWorkflowRunDetails(req: Request, res: Response) {
  try {
    const { owner, repo, runId } = req.params;
    const accessToken = (req as any).accessToken as string;

    const [{ run, rateLimit }, jobsResponse] = await Promise.all([
      getWorkflowRun(owner, repo, Number(runId), accessToken),
      getWorkflowRunJobs(owner, repo, Number(runId), accessToken, 1, 100),
    ]);

    res.json({
      success: true,
      run,
      jobs: jobsResponse.jobs,
      jobsTotalCount: jobsResponse.totalCount,
      rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch workflow run details',
      message: extractErrorMessage(error),
    });
  }
}

export async function getWorkflowJobLogs(req: Request, res: Response) {
  try {
    const { owner, repo, jobId } = req.params;
    const runId = Number(req.query.runId);
    const cursor = req.query.cursor ? Number(req.query.cursor) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 500;
    const accessToken = (req as any).accessToken as string;

    const jobsResponse = await getWorkflowRunJobs(
      owner,
      repo,
      runId,
      accessToken,
      1,
      100
    );
    const job = jobsResponse.jobs.find(item => item.id === Number(jobId));

    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Workflow job not found',
      });
      return;
    }

    const { logs, rateLimit } = await getJobLogs(
      owner,
      repo,
      Number(jobId),
      accessToken
    );

    const parsedLogs = buildJobLogsResponse(job, logs, cursor, limit);
    await createAuditLogIfNeeded(req, 'view_logs', 'job', jobId, job.name, {
      runId,
      cursor,
      limit,
    });

    res.json({
      success: true,
      logs: parsedLogs,
      rawLogsLength: logs.length,
      githubUrl: job.html_url,
      rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch job logs',
      message: extractErrorMessage(error),
    });
  }
}

export async function triggerRepositoryWorkflow(req: Request, res: Response) {
  try {
    const { owner, repo } = req.params;
    const accessToken = (req as any).accessToken as string;
    const { workflow, ref, inputs } = req.body ?? {};

    const result = await triggerWorkflow(accessToken, {
      owner,
      repo,
      workflow,
      ref,
      inputs,
    });

    await createAuditLogIfNeeded(
      req,
      'trigger',
      'pipeline',
      String(workflow),
      String(workflow),
      { owner, repo, ref, inputs }
    );

    res.json({
      success: result.response.success,
      message: result.response.message,
      rateLimit: result.rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to trigger workflow',
      message: extractErrorMessage(error),
    });
  }
}

export async function cancelRepositoryWorkflowRun(req: Request, res: Response) {
  try {
    const { owner, repo, runId } = req.params;
    const accessToken = (req as any).accessToken as string;
    const result = await cancelWorkflowRun(
      owner,
      repo,
      Number(runId),
      accessToken
    );

    await createAuditLogIfNeeded(
      req,
      'cancel',
      'workflow_run',
      runId,
      `Run ${runId}`,
      { owner, repo }
    );

    res.json({
      success: result.success,
      rateLimit: result.rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to cancel workflow run',
      message: extractErrorMessage(error),
    });
  }
}

export async function rerunRepositoryWorkflowRun(req: Request, res: Response) {
  try {
    const { owner, repo, runId } = req.params;
    const accessToken = (req as any).accessToken as string;
    const failedOnly = Boolean(req.body?.failedOnly);
    const result = await rerunWorkflow(
      owner,
      repo,
      Number(runId),
      accessToken,
      failedOnly
    );

    await createAuditLogIfNeeded(
      req,
      'rerun',
      'workflow_run',
      runId,
      `Run ${runId}`,
      { owner, repo, failedOnly }
    );

    res.json({
      success: result.success,
      rateLimit: result.rateLimit,
    });
  } catch (error) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to rerun workflow',
      message: extractErrorMessage(error),
    });
  }
}
