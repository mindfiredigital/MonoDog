import { Request, Response } from 'express';
import '../types/controllers';
import { AppLogger } from '../middleware/logger';
import {
  getWorkspacePackages,
  getExistingChangesets,
  calculateNewVersions,
  generateChangeset,
  isWorkingTreeClean,
  triggerPublishPipeline,
  checkCIPassing,
  checkVersionAvailableOnNpm,
} from '../services/changeset-service';
import * as pipelineService from '../services/pipeline-service';
import { getRepositoryInfoFromGit } from '../utils/utilities';
import { listWorkflows } from '../services/github-actions-service';
import {
  PUBLISH_MESSAGES,
  CHANGESET_MESSAGES,
  VALIDATION_ERRORS,
  PERMISSION_ERRORS,
  OPERATION_ERRORS,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  extractErrorMessage,
  PERMISSION_HIERARCHY,
} from '../constants';

/**
 * Get all workspace packages
 */
export async function getPublishPackages(req: Request, res: Response) {
  try {
    const rootPath = req.app.locals.rootPath;
    const packages = await getWorkspacePackages(rootPath);

    // Filter out private packages for UI display
    const publicPackages = packages.filter((pkg) => !pkg.private);

    res.json({
      success: true,
      packages: publicPackages,
      total: publicPackages.length,
    });
  } catch (error) {
    AppLogger.error(`Failed to fetch packages: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_PACKAGES,
      message: extractErrorMessage(error),
    });
  }
}

/**
 * Get existing unpublished changesets
 */
export async function getPublishChangesets(req: Request, res: Response) {
  try {
    const rootPath = req.app.locals.rootPath;
    const changesets = await getExistingChangesets(rootPath);

    res.json({
      success: true,
      changesets,
      total: changesets.length,
    });
  } catch (error) {
    AppLogger.error(`Failed to fetch changesets: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_FETCH_CHANGESETS,
    });
  }
}

/**
 * Preview publish plan (calculate new versions, affected packages)
 */
export async function previewPublish(req: Request, res: Response) {
  try {
    const { packages: selectedPackageNames, bumps } = req.body;

    if (!selectedPackageNames || !Array.isArray(selectedPackageNames)) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.PACKAGES_ARRAY_REQUIRED,
      });
      return;
    }

    const rootPath = req.app.locals.rootPath;
    const allPackages = await getWorkspacePackages(rootPath);

    // Filter selected packages
    const selectedPackages = allPackages.filter((pkg) =>
      selectedPackageNames.includes(pkg.name)
    );

    // Calculate new versions
    const newVersions = calculateNewVersions(selectedPackages, bumps || []);

    // Check if working tree is clean
    const isClean = await isWorkingTreeClean(rootPath);

    // Get existing changesets
    const changesets = await getExistingChangesets(rootPath);

    // Perform validation checks
    const errors: string[] = [];
    const warnings: string[] = [];
    // Get authenticated user
    const authUser = req.user;
    const userPermission = (req as any).permission.permission || 'read';
    const accessToken = req.accessToken;

    // Check 1: Working tree clean
    const workingTreeClean = isClean;
    if (!workingTreeClean) {
      errors.push(VALIDATION_ERRORS.WORKING_TREE_NOT_CLEAN);
    }

    // Check 2: User permissions
    const userLevel = PERMISSION_HIERARCHY[userPermission.toUpperCase() as keyof typeof PERMISSION_HIERARCHY]?.level || 0;
    const requiredLevel = PERMISSION_HIERARCHY.WRITE.level;
    const permissions = userLevel >= requiredLevel;
    if (!permissions) {
      errors.push(`Insufficient permissions. Required: write, Got: ${userPermission}`);
    }

    // Check 3: CI passing - Check if most recent workflow run passed
    let ciPassing = false;
    try {
      const repoInfo = await getRepositoryInfoFromGit();
      if (repoInfo && accessToken) {
        const { owner, repo } = repoInfo;

        // Fetch the workflow ID from GitHub
        try {
          const workflowsResponse = await listWorkflows(owner, repo, accessToken);
          const releaseWorkflow = workflowsResponse.workflows.find(
            (workflow) =>
              workflow.name === 'Release' ||
              workflow.name === 'Deployment Workflow' ||
              workflow.name.toLowerCase().includes('release') ||
              workflow.name.toLowerCase().includes('deployment')
          );

          if (releaseWorkflow) {
            const workflowId = String(releaseWorkflow.id);
            const workflowPath = String(releaseWorkflow.path);

            // Check CI status using the helper function
            ciPassing = await checkCIPassing(accessToken, owner, repo, workflowId, workflowPath);

            if (!ciPassing) {
              warnings.push('Latest CI workflow run did not pass');
            }
          } else {
            AppLogger.warn('Release workflow not found, skipping CI check');
            ciPassing = true; // Allow if no workflow found
          }
        } catch (workflowError) {
          AppLogger.error(`Failed to fetch workflows for CI check: ${workflowError}`);
          ciPassing = true; // Allow if workflow fetch fails
        }
      } else {
        AppLogger.warn('No repository info or access token to check CI');
        ciPassing = true; // Allow if no auth
      }
    } catch (ciCheckError) {
      AppLogger.error(`CI check error: ${ciCheckError}`);
      ciPassing = true; // Allow on error
    }

    // Check 4: Version available on npm - Verify new versions don't exist on npm
    let versionAvailable = true;
    try {
      for (const pkg of newVersions) {
        const available = await checkVersionAvailableOnNpm(pkg.package, pkg.newVersion);
        if (!available) {
          versionAvailable = false;
          errors.push(`Version ${pkg.newVersion} of package ${pkg.package} already exists on npm`);
        }
      }
    } catch (npmCheckError) {
      AppLogger.error(`NPM version check error: ${npmCheckError}`);
      // Don't fail the check on error, set to true
      versionAvailable = true;
    }

    AppLogger.info(`Publishing preview for user: ${authUser?.login} (permission: ${userPermission})`);

    const isValid = errors.length === 0;

    res.json({
      success: true,
      isValid,
      errors,
      warnings,
      checks: {
        permissions,
        workingTreeClean,
        ciPassing,
        versionAvailable,
      },
      preview: {
        packages: newVersions,
        workingTreeClean: isClean,
        existingChangesets: changesets.length,
        affectedPackages: newVersions.length,
      },
    });
  } catch (error) {
    AppLogger.error(`Failed to preview publish: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_PREVIEW_PUBLISH,
      message: extractErrorMessage(error),
    });
  }
}

/**
 * Create a new changeset
 */
export async function createChangeset(req: Request, res: Response) {
  try {
    const { packages: selectedPackageNames, bumps, summary } = req.body;
    const authUser = (req as any).user;
    const userPermission = (req as any).permission.permission || 'read';

    if (!selectedPackageNames || !Array.isArray(selectedPackageNames)) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_REQUEST,
        message: VALIDATION_ERRORS.PACKAGES_ARRAY_REQUIRED,
      });
      return;
    }

    if (!summary || typeof summary !== 'string' || summary.length < 10) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.INVALID_SUMMARY,
        message: VALIDATION_ERRORS.SUMMARY_TOO_SHORT,
      });
      return;
    }

    // Check permissions
    const userLevel = PERMISSION_HIERARCHY[userPermission.toUpperCase() as keyof typeof PERMISSION_HIERARCHY]?.level || 0;
    const requiredLevel = PERMISSION_HIERARCHY.WRITE.level;
    if (userLevel < requiredLevel) {
      AppLogger.warn(`User ${authUser?.login} attempted to create changeset without write permission`);
      res.status(HTTP_STATUS_FORBIDDEN).json({
        success: false,
        error: PERMISSION_ERRORS.FORBIDDEN,
        message: PERMISSION_ERRORS.INSUFFICIENT_WRITE_PERMISSION(userPermission),
      });
      return;
    }

    const rootPath = req.app.locals.rootPath;

    AppLogger.info(`Creating changeset for user: ${authUser?.login} (permission: ${userPermission})`);

    // Generate the changeset
    const result = await generateChangeset(
      rootPath,
      selectedPackageNames,
      bumps || [],
      summary,
      authUser?.login
    );

    if (!result.success) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: OPERATION_ERRORS.FAILED_TO_CREATE_CHANGESET,
        message: result.message,
      });
      return;
    }

    res.json({
      success: true,
      changeset: result.changeset,
      message: CHANGESET_MESSAGES.CREATED,
    });
  } catch (error) {
    AppLogger.error(`Failed to create changeset: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_CREATE_CHANGESET,
      message: extractErrorMessage(error),
    });
  }
}

/**
 * Check publish readiness
 */
export async function checkPublishStatus(req: Request, res: Response) {
  try {
    const rootPath = req.app.locals.rootPath;

    // Check if working tree is clean
    const isClean = await isWorkingTreeClean(rootPath);

    // Get existing changesets
    const changesets = await getExistingChangesets(rootPath);

    res.json({
      success: true,
      status: {
        workingTreeClean: isClean,
        hasChangesets: changesets.length > 0,
        changesetCount: changesets.length,
        readyToPublish: isClean && changesets.length > 0,
      },
    });
  } catch (error) {
    AppLogger.error(`Failed to check publish status: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_PUBLISH,
    });
  }
}

/**
 * Trigger publishing workflow
 */
export async function triggerPublish(req: Request, res: Response) {
  try {
    const rootPath = req.app.locals.rootPath;
    const authUser = (req as any).user;
    const userPermission = (req as any).permission.permission || 'read';
    const { packages: selectedPackages } = req.body;
    const selectedPackageNames = selectedPackages?.map((pkg: Record<string, string|string[]>) => pkg.name) || [];
    // Check permissions
    const userLevel = PERMISSION_HIERARCHY[userPermission.toUpperCase() as keyof typeof PERMISSION_HIERARCHY]?.level || 0;
    const requiredLevel = PERMISSION_HIERARCHY.MAINTAIN.level;
    if (userLevel < requiredLevel) {
      AppLogger.warn(`User ${authUser?.login} attempted to trigger publish without maintain permission`);
      res.status(HTTP_STATUS_FORBIDDEN).json({
        success: false,
        error: PERMISSION_ERRORS.FORBIDDEN,
        message: PERMISSION_ERRORS.INSUFFICIENT_MAINTAIN_PERMISSION(userPermission),
      });
      return;
    }

    // Check if working tree is clean
    const isClean = await isWorkingTreeClean(rootPath);
    if (!isClean) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.WORKING_TREE_NOT_CLEAN,
        message: VALIDATION_ERRORS.WORKING_TREE_NOT_CLEAN,
      });
      return;
    }

    // Check if changesets exist
    const changesets = await getExistingChangesets(rootPath);
    if (changesets.length === 0) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: VALIDATION_ERRORS.NO_CHANGESETS,
        message: VALIDATION_ERRORS.NO_CHANGESETS,
      });
      return;
    }

    AppLogger.info(`Triggering publish for user: ${authUser?.login} (permission: ${userPermission})`);

    // Trigger publish pipeline with user context and package info
    const result = await triggerPublishPipeline(rootPath, authUser?.login, selectedPackages);

    if (!result.success) {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        error: OPERATION_ERRORS.FAILED_TO_PUBLISH,
        message: result.message,
      });
      return;
    }

    // Create pipeline records in database for each package
    AppLogger.info(`Checking if should create pipelines: selectedPackageNames=${JSON.stringify(selectedPackageNames)}, isArray=${Array.isArray(selectedPackageNames)}`);

    if (selectedPackages && Array.isArray(selectedPackages)) {
      AppLogger.info(`Creating pipelines for ${selectedPackages.length} packages`);
      try {
        const repoInfo = await getRepositoryInfoFromGit();

        if (!repoInfo) {
          AppLogger.warn('Could not extract repository info from git remote - permission fetch skipped');
        } else {

          const { owner, repo } = repoInfo;

          const timestamp = new Date().toISOString();
          AppLogger.info(`Extracted GitHub: owner=${owner}, repo=${repo}`);

          // Fetch the actual workflow ID from GitHub
          const accessToken = (req as any).accessToken;
          let realWorkflowId = '1'; // Fallback to '1' if fetch fails
          let workflowPath = 'release.yml'; // Default path for reference

          if (accessToken) {
            try {
              AppLogger.info(`Fetching workflows for ${owner}/${repo}`);
              const workflowsResponse = await listWorkflows(owner, repo, accessToken);

              // Find the main deployment/release workflow (could be named "Release", "Deployment Workflow", etc.)
              const releaseWorkflow = workflowsResponse.workflows.find(
                (workflow) =>
                  workflow.name === 'Release' ||
                  workflow.name === 'Deployment Workflow' ||
                  workflow.name.toLowerCase().includes('release') ||
                  workflow.name.toLowerCase().includes('deployment')
              );

              if (releaseWorkflow) {
                realWorkflowId = String(releaseWorkflow.id);
                workflowPath = String(releaseWorkflow.path);
                AppLogger.info(`Found Release workflow with ID: ${realWorkflowId} (name: ${releaseWorkflow.name})`);
              } else {
                AppLogger.warn(`Release workflow not found. Available workflows: ${workflowsResponse.workflows.map(w => `${w.name}(${w.id})`).join(', ')}`);
              }
            } catch (workflowFetchError) {
              AppLogger.warn(`Failed to fetch workflows: ${workflowFetchError}. Using fallback ID 1`);
            }
          } else {
            AppLogger.warn('No access token available to fetch workflows');
          }

          for (const pkg of selectedPackages) {
            try {
              AppLogger.info(`Creating pipeline for package: ${pkg.name}`);
              await pipelineService.createOrUpdatePipeline({
                releaseVersion: pkg.newVersion,
                packageName: pkg.name,
                owner,
                repo,
                workflowId: realWorkflowId,
                workflowName: 'Release',
                workflowPath: workflowPath,
                triggerType: 'manual',
                triggeredBy: authUser?.login || 'unknown',
                triggeredAt: timestamp,
                currentStatus: 'queued',
                currentConclusion: null,
                lastRunId: undefined,
              });
              AppLogger.info(`Created pipeline record for package: ${pkg.name}`);
            } catch (pipelineError) {
              AppLogger.warn(`Failed to create pipeline for ${pkg.name}: ${pipelineError}`);
              // Don't fail the whole request if pipeline creation fails
            }
          }
        }
      } catch (configError) {
        AppLogger.error(`Failed to read package.json for pipeline creation: ${configError}`);
      }
    } else {
      AppLogger.warn(`Skipping pipeline creation: selectedPackageNames is ${selectedPackageNames}`);
    }

    res.json({
      success: true,
      message: PUBLISH_MESSAGES.WORKFLOW_INITIATED,
      result: result.result,
    });
  } catch (error) {
    AppLogger.error(`Failed to trigger publish: ${error}`);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: OPERATION_ERRORS.FAILED_TO_PUBLISH,
      message: extractErrorMessage(error),
    });
  }
}
