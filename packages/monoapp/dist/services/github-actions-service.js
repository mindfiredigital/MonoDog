"use strict";
/**
 * GitHub Actions API Service
 * Handles GitHub Actions workflow management, runs, jobs, and logs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWorkflows = listWorkflows;
exports.getWorkflowRuns = getWorkflowRuns;
exports.getWorkflowRun = getWorkflowRun;
exports.getWorkflowRunJobs = getWorkflowRunJobs;
exports.getJobLogs = getJobLogs;
exports.parseJobLogs = parseJobLogs;
exports.triggerWorkflow = triggerWorkflow;
exports.cancelWorkflowRun = cancelWorkflowRun;
exports.rerunWorkflow = rerunWorkflow;
const https_1 = __importDefault(require("https"));
const logger_1 = require("../middleware/logger");
const features_1 = require("../constants/features");
const api_messages_1 = require("../constants/api-messages");
const GITHUB_API_BASE = 'api.github.com';
const requestOptions = (method, path, accessToken, payload) => {
    const body = payload ?? null;
    return {
        hostname: GITHUB_API_BASE,
        path,
        method: method.toUpperCase(),
        headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            'User-Agent': 'MonoDog',
            Accept: 'application/vnd.github+json',
            // Conditional Body Headers
            ...(body && {
                'Content-Type': 'application/json',
                'Content-Length': String(Buffer.byteLength(body)),
            }),
        },
    };
};
const redirectOptions = (url) => ({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
        'User-Agent': 'MonoDog',
    },
});
/**
 * Make an HTTPS request to GitHub API
 */
function makeGitHubRequest(options, data) {
    return new Promise((resolve, reject) => {
        const request = https_1.default.request(options, (response) => {
            let body = '';
            const rateLimit = {
                limit: parseInt(response.headers['x-ratelimit-limit']) || 5000,
                remaining: parseInt(response.headers['x-ratelimit-remaining']) || 0,
                reset: parseInt(response.headers['x-ratelimit-reset']) || 0,
                used: parseInt(response.headers['x-ratelimit-used']) || 0,
            };
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                try {
                    if (response.statusCode && response.statusCode >= 400) {
                        reject(new Error(`GitHub API error: ${response.statusCode} - ${body}`));
                    }
                    else {
                        const result = body ? JSON.parse(body) : {};
                        resolve({ data: result, rateLimit });
                    }
                }
                catch (error) {
                    reject(new Error(`Failed to parse GitHub API response: ${error}`));
                }
            });
        });
        request.on('error', (error) => {
            logger_1.AppLogger.error(`GitHub API request failed: ${error.message}`);
            reject(error);
        });
        request.setTimeout(15000, () => {
            request.destroy();
            reject(new Error('GitHub API request timeout'));
        });
        if (data) {
            request.write(data);
        }
        request.end();
    });
}
/**
 * List available workflows in a repository
 */
async function listWorkflows(owner, repo, accessToken) {
    const path = features_1.GITHUB_ACTIONS.WORKFLOWS_ENDPOINT(owner, repo);
    try {
        const { data, rateLimit } = await makeGitHubRequest(requestOptions('GET', path, accessToken));
        return {
            workflows: data.workflows,
            rateLimit,
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to list workflows: ${error}`);
        throw error;
    }
}
/**
 * Get workflow runs for a repository
 */
async function getWorkflowRuns(owner, repo, accessToken, options) {
    const params = new URLSearchParams();
    // Determine which workflow to filter by
    let workflowToFilter = null;
    // Prioritize numeric workflow ID - it's the most reliable GitHub API parameter
    if (options?.workflowId && Number(options.workflowId) !== 1) {
        params.append('workflow_id', String(options.workflowId));
        logger_1.AppLogger.info(`getWorkflowRuns: Using numeric workflow_id=${options.workflowId} (most reliable)`);
    }
    else if (options?.workflowPath) {
        // Fall back to full workflow path if numeric ID is not valid
        // Use the full path (.github/workflows/release.yml) not just the filename
        workflowToFilter = options.workflowPath;
        logger_1.AppLogger.info(`getWorkflowRuns: Using full workflowPath=${options.workflowPath}`);
    }
    else {
        // Last resort: default to release.yml workflow
        workflowToFilter = '.github/workflows/release.yml';
        logger_1.AppLogger.warn(`getWorkflowRuns: Using default workflow path (no valid ID or path provided)`);
    }
    // Add the workflow filter if we have one and didn't already use workflow_id
    if (workflowToFilter && !params.has('workflow_id')) {
        params.append('workflow', workflowToFilter);
        logger_1.AppLogger.info(`getWorkflowRuns: Added workflow filter=${workflowToFilter} (using path parameter)`);
    }
    if (options?.status) {
        params.append('status', options.status);
    }
    if (options?.conclusion) {
        params.append('conclusion', options.conclusion);
    }
    params.append('page', String(options?.page || 1));
    params.append('per_page', String(options?.per_page || 30));
    const basePath = features_1.GITHUB_ACTIONS.WORKFLOW_RUNS_ENDPOINT(owner, repo, '');
    const path = `${basePath.replace('/workflows//runs', '/runs')}?${params.toString()}`;
    try {
        const fullUrl = `https://${GITHUB_API_BASE}${path}`;
        logger_1.AppLogger.info(`GitHub API Request: GET ${fullUrl.substring(0, 150)}...`);
        const { data, rateLimit } = await makeGitHubRequest(requestOptions('GET', path, accessToken));
        logger_1.AppLogger.info(`GitHub API Response: total_count=${data.total_count}, returned ${data.workflow_runs.length} runs`);
        if (workflowToFilter || (options?.workflowId && Number(options.workflowId) !== 1)) {
            logger_1.AppLogger.info(`Filtered request returned ${data.workflow_runs.length} runs (workflow=${workflowToFilter})`);
        }
        return {
            runs: data.workflow_runs,
            totalCount: data.total_count,
            rateLimit,
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get workflow runs: ${error}`);
        throw error;
    }
}
/**
 * Get specific workflow run
 */
async function getWorkflowRun(owner, repo, runId, accessToken) {
    const path = features_1.GITHUB_ACTIONS.WORKFLOW_RUN_ENDPOINT(owner, repo, runId);
    try {
        const { data, rateLimit } = await makeGitHubRequest(requestOptions('GET', path, accessToken));
        return { run: data, rateLimit };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get workflow run ${runId}: ${error}`);
        throw error;
    }
}
/**
 * Get jobs for a workflow run
 */
async function getWorkflowRunJobs(owner, repo, runId, accessToken, page = 1, perPage = 30) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(perPage));
    const path = `${features_1.GITHUB_ACTIONS.JOBS_ENDPOINT(owner, repo, runId)}?${params.toString()}`;
    try {
        const { data, rateLimit } = await makeGitHubRequest(requestOptions('GET', path, accessToken));
        return {
            jobs: data.jobs,
            totalCount: data.total_count,
            rateLimit,
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to get jobs for run ${runId}: ${error}`);
        throw error;
    }
}
/**
 * Get logs for a specific job
 * Returns raw logs that need to be parsed
 */
async function getJobLogs(owner, repo, jobId, accessToken) {
    const path = `${features_1.GITHUB_ACTIONS.LOGS_ENDPOINT(owner, repo, jobId)}`;
    logger_1.AppLogger.info(`Fetching job logs from GitHub: owner=${owner}, repo=${repo}, jobId=${jobId}`);
    return new Promise((resolve, reject) => {
        const request = https_1.default.request(requestOptions('GET', path, accessToken), (response) => {
            let body = '';
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303) {
                const location = response.headers.location;
                logger_1.AppLogger.info(`GitHub redirected logs request to: ${location}`);
                if (location) {
                    // Recursively follow redirect with GET
                    const url = new URL(location);
                    const redirectRequest = https_1.default.request(redirectOptions(url), (redirectResponse) => {
                        let redirectBody = '';
                        redirectResponse.on('data', (chunk) => {
                            redirectBody += chunk;
                        });
                        redirectResponse.on('end', () => {
                            const rateLimit = {
                                limit: parseInt(redirectResponse.headers['x-ratelimit-limit']) || 5000,
                                remaining: parseInt(redirectResponse.headers['x-ratelimit-remaining']) || 0,
                                reset: parseInt(redirectResponse.headers['x-ratelimit-reset']) || 0,
                                used: parseInt(redirectResponse.headers['x-ratelimit-used']) || 0,
                            };
                            // Check for errors in the redirect response too
                            if (redirectResponse.statusCode && redirectResponse.statusCode >= 400) {
                                logger_1.AppLogger.error(`GitHub API error after redirect ${redirectResponse.statusCode}: ${redirectBody.substring(0, 200)}`);
                                reject(new Error(`GitHub API error: ${redirectResponse.statusCode} - ${redirectBody}`));
                            }
                            else if (!redirectBody || redirectBody.trim().length === 0) {
                                logger_1.AppLogger.warn(`Job logs are empty after redirect (status=${redirectResponse.statusCode})`);
                                resolve({ logs: '', rateLimit });
                            }
                            else {
                                logger_1.AppLogger.info(`Fetched ${redirectBody.length} characters of job logs from redirect`);
                                resolve({ logs: redirectBody, rateLimit });
                            }
                        });
                    });
                    redirectRequest.on('error', (error) => {
                        logger_1.AppLogger.error(`Failed to follow redirect for job logs: ${error.message}`);
                        reject(error);
                    });
                    redirectRequest.end();
                    return;
                }
            }
            const rateLimit = {
                limit: parseInt(response.headers['x-ratelimit-limit']) || 5000,
                remaining: parseInt(response.headers['x-ratelimit-remaining']) || 0,
                reset: parseInt(response.headers['x-ratelimit-reset']) || 0,
                used: parseInt(response.headers['x-ratelimit-used']) || 0,
            };
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                try {
                    logger_1.AppLogger.debug(`Job logs response: status=${response.statusCode}, length=${body.length}`);
                    if (response.statusCode && response.statusCode >= 400) {
                        logger_1.AppLogger.error(`GitHub API error ${response.statusCode}: ${body.substring(0, 200)}`);
                        reject(new Error(`GitHub API error: ${response.statusCode} - ${body}`));
                    }
                    else if (!body || body.trim().length === 0) {
                        logger_1.AppLogger.warn(`Job logs are empty (status=${response.statusCode})`);
                        resolve({ logs: '', rateLimit });
                    }
                    else {
                        logger_1.AppLogger.info(`Fetched ${body.length} characters of job logs`);
                        resolve({ logs: body, rateLimit });
                    }
                }
                catch (error) {
                    reject(new Error(`Failed to parse job logs: ${error}`));
                }
            });
        });
        request.on('error', (error) => {
            logger_1.AppLogger.error(`Failed to fetch job logs: ${error.message}`);
            reject(error);
        });
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Job logs request timeout'));
        });
        request.end();
    });
}
/**
 * Parse raw GitHub Actions logs into structured step logs
 * GitHub Actions logs have format:
 * \u001b[36m##[group]Group Name\u001b[0m
 * Log line here
 * \u001b[36m##[endgroup]\u001b[0m
 */
function parseJobLogs(rawLogs, job) {
    const steps = [];
    const lines = rawLogs.split('\n');
    let currentStep = null;
    let lineNumber = 0;
    for (const line of lines) {
        lineNumber++;
        // Check for group start (step start)
        if (line.includes('##[group]')) {
            // Save previous step if exists
            if (currentStep) {
                steps.push(currentStep);
            }
            // Extract step name
            // eslint-disable-next-line no-control-regex
            const nameMatch = line.match(/##\[group\](.*?)(\u001b\[0m)?$/);
            const stepName = nameMatch ? nameMatch[1].trim() : `Step ${steps.length + 1}`;
            // Find matching step in workflow
            const workflowStep = job.steps.find((s) => s.name.toLowerCase() === stepName.toLowerCase());
            currentStep = {
                stepNumber: steps.length + 1,
                stepName,
                startedAt: workflowStep?.started_at || null,
                completedAt: workflowStep?.completed_at || null,
                conclusion: workflowStep?.conclusion || null,
                status: workflowStep?.status || 'queued',
                logs: [],
                expanded: true,
            };
        }
        else if (line.includes('##[endgroup]')) {
            // Step end marker - do nothing, step will be saved on next group or end
        }
        else if (line.trim() && currentStep) {
            // Add log line to current step
            const logLine = {
                lineNumber,
                timestamp: extractTimestamp(line),
                content: stripAnsiCodes(line),
                ansiContent: line,
            };
            currentStep.logs.push(logLine);
        }
    }
    // Add last step if exists
    if (currentStep) {
        steps.push(currentStep);
    }
    // If no steps were parsed, create one for all logs
    if (steps.length === 0 && lines.length > 0) {
        steps.push({
            stepNumber: 1,
            stepName: 'Output',
            startedAt: job.started_at,
            completedAt: job.completed_at,
            conclusion: job.conclusion,
            status: job.status,
            logs: lines.map((line, idx) => ({
                lineNumber: idx + 1,
                timestamp: extractTimestamp(line),
                content: stripAnsiCodes(line),
                ansiContent: line,
            })),
            expanded: true,
        });
    }
    return steps;
}
/**
 * Extract timestamp from log line
 * GitHub format: 2024-02-11T12:34:56.123456789Z
 */
function extractTimestamp(line) {
    const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z/;
    const match = line.match(isoRegex);
    return match ? match[0] : new Date().toISOString();
}
/**
 * Strip ANSI codes from text
 * Keeps the text content but removes styling
 */
function stripAnsiCodes(text) {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\u001b\[[0-9;]*m/g, '').replace(/\u001b\[K/g, '');
}
/**
 * Trigger a workflow run
 */
async function triggerWorkflow(accessToken, request) {
    // Ensure workflow is a string - convert number if needed
    let workflowIdentifier = String(request.workflow);
    // If it looks like a path (contains slashes), extract filename
    if (workflowIdentifier.includes('/')) {
        // Convert .github/workflows/ci.yml to ci.yml
        workflowIdentifier = workflowIdentifier.split('/').pop() || workflowIdentifier;
    }
    const path = features_1.GITHUB_ACTIONS.TRIGGER_WORKFLOW_ENDPOINT(request.owner, request.repo, workflowIdentifier);
    const payload = JSON.stringify({
        ref: request.ref,
        inputs: request.inputs || {},
    });
    try {
        logger_1.AppLogger.debug(`Triggering workflow: ${workflowIdentifier} (original: ${request.workflow}) on ${request.owner}/${request.repo} branch: ${request.ref}`);
        const response = await makeGitHubRequest(requestOptions('POST', path, accessToken, payload), payload);
        // GitHub returns 204 No Content on success
        logger_1.AppLogger.info(`Workflow triggered successfully: ${workflowIdentifier}`);
        return {
            response: {
                success: true,
                message: api_messages_1.PIPELINE_MESSAGES.TRIGGERED_SUCCESSFULLY,
            },
            rateLimit: response.rateLimit,
        };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to trigger workflow ${workflowIdentifier}: ${error}`);
        return {
            response: {
                success: false,
                message: `Failed to trigger workflow: ${error}`,
            },
            rateLimit: { limit: 0, remaining: 0, reset: 0, used: 0 },
        };
    }
}
/**
 * Cancel a workflow run
 */
async function cancelWorkflowRun(owner, repo, runId, accessToken) {
    const path = features_1.GITHUB_ACTIONS.CANCEL_ENDPOINT(owner, repo, runId);
    try {
        const { rateLimit } = await makeGitHubRequest(requestOptions('POST', path, accessToken));
        return { success: true, rateLimit };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to cancel workflow run: ${error}`);
        return {
            success: false,
            rateLimit: { limit: 0, remaining: 0, reset: 0, used: 0 },
        };
    }
}
/**
 * Re-run a workflow run
 */
async function rerunWorkflow(owner, repo, runId, accessToken, failedOnly = false) {
    const basePath = features_1.GITHUB_ACTIONS.RERUN_ENDPOINT(owner, repo, runId);
    const path = failedOnly ? `${basePath}-failed-jobs` : basePath;
    try {
        const { rateLimit } = await makeGitHubRequest(requestOptions('POST', path, accessToken));
        return { success: true, rateLimit };
    }
    catch (error) {
        logger_1.AppLogger.error(`Failed to rerun workflow: ${error}`);
        return {
            success: false,
            rateLimit: { limit: 0, remaining: 0, reset: 0, used: 0 },
        };
    }
}
