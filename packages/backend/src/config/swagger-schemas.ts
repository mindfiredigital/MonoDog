/**
 * Swagger Schema Definitions
 * Contains OpenAPI component schemas, responses, and security schemes
 */

export const swaggerSchemas = {
  schemas: {
    Package: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Package name',
        },
        path: {
          type: 'string',
          description: 'Package path in monorepo',
        },
        version: {
          type: 'string',
          description: 'Package version',
        },
        size: {
          type: 'number',
          description: 'Package size in bytes',
        },
        dependencies: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of package dependencies',
        },
      },
    },
    PackageHealth: {
      type: 'object',
      properties: {
        packageName: {
          type: 'string',
          description: 'Name of the package',
        },
        healthScore: {
          type: 'number',
          description: 'Health score (0-100)',
          minimum: 0,
          maximum: 100,
        },
        lintStatus: {
          type: 'string',
          enum: ['pass', 'warning', 'fail'],
          description: 'Linting status',
        },
        buildStatus: {
          type: 'string',
          enum: ['success', 'failed', 'pending'],
          description: 'Build status',
        },
        securityStatus: {
          type: 'string',
          enum: ['secure', 'warning', 'vulnerable'],
          description: 'Security status',
        },
        testCoverage: {
          type: 'number',
          description: 'Test coverage percentage',
        },
      },
    },
    Commit: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'Commit hash',
        },
        author: {
          type: 'string',
          description: 'Commit author',
        },
        message: {
          type: 'string',
          description: 'Commit message',
        },
        date: {
          type: 'string',
          format: 'date-time',
          description: 'Commit date',
        },
        filesChanged: {
          type: 'number',
          description: 'Number of files changed',
        },
      },
    },
    ConfigFile: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Configuration file ID',
        },
        name: {
          type: 'string',
          description: 'Configuration file name',
        },
        path: {
          type: 'string',
          description: 'Configuration file path',
        },
        content: {
          type: 'string',
          description: 'Configuration file content',
        },
      },
    },
    ReleasePipeline: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique pipeline ID',
        },
        releaseVersion: {
          type: 'string',
          description: 'Release version number',
        },
        packageName: {
          type: 'string',
          description: 'Name of the package being released',
        },
        owner: {
          type: 'string',
          description: 'Repository owner',
        },
        repo: {
          type: 'string',
          description: 'Repository name',
        },
        workflowId: {
          type: 'string',
          description: 'GitHub workflow ID',
        },
        workflowName: {
          type: 'string',
          description: 'GitHub workflow name',
        },
        workflowPath: {
          type: 'string',
          description: 'Path to the workflow file',
        },
        triggerType: {
          type: 'string',
          description: 'Type of trigger (e.g., "manual", "scheduled")',
        },
        triggeredBy: {
          type: 'string',
          description: 'Username of who triggered the release',
        },
        triggeredAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the pipeline was triggered',
        },
        currentStatus: {
          type: 'string',
          enum: ['queued', 'in_progress', 'completed'],
          description: 'Current pipeline status',
        },
        currentConclusion: {
          type: 'string',
          enum: ['success', 'failure', 'cancelled', 'skipped', 'neutral'],
          description: 'Pipeline conclusion result',
        },
        lastRunId: {
          type: 'string',
          description: 'ID of the last workflow run',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the pipeline record was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the pipeline record was last updated',
        },
      },
    },
    PublishPackage: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Package name',
        },
        path: {
          type: 'string',
          description: 'Package path in the monorepo',
        },
        version: {
          type: 'string',
          description: 'Current version of the package',
        },
        private: {
          type: 'boolean',
          description: 'Whether the package is private',
        },
        dependencies: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Package dependencies',
        },
        devDependencies: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Dev dependencies',
        },
      },
    },
    Changeset: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Changeset ID or filename',
        },
        packages: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of packages affected by this changeset',
        },
        summary: {
          type: 'string',
          description: 'Summary of changes in the changeset',
        },
        author: {
          type: 'string',
          description: 'GitHub username of the changeset author',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the changeset was created',
        },
      },
    },
    VersionBump: {
      type: 'object',
      required: ['package', 'bumpType'],
      properties: {
        package: {
          type: 'string',
          description: 'Package name',
        },
        bumpType: {
          type: 'string',
          enum: ['major', 'minor', 'patch'],
          description: 'Type of version bump to apply',
        },
      },
    },
    PublishPreview: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Whether the preview was successful',
        },
        isValid: {
          type: 'boolean',
          description: 'Whether the publish operation is valid and can proceed',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of validation errors that prevent publishing',
        },
        warnings: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of validation warnings',
        },
        checks: {
          type: 'object',
          properties: {
            permissions: {
              type: 'boolean',
              description: 'Whether the user has sufficient permissions',
            },
            workingTreeClean: {
              type: 'boolean',
              description: 'Whether the working tree is clean',
            },
            ciPassing: {
              type: 'boolean',
              description: 'Whether the latest CI run passed',
            },
            versionAvailable: {
              type: 'boolean',
              description: 'Whether the new versions are available on npm',
            },
          },
          description: 'Individual validation check results',
        },
        preview: {
          type: 'object',
          properties: {
            packages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  package: { type: 'string' },
                  oldVersion: { type: 'string' },
                  newVersion: { type: 'string' },
                  bumpType: { type: 'string' },
                },
              },
              description: 'Package version changes in the preview',
            },
            workingTreeClean: {
              type: 'boolean',
            },
            existingChangesets: {
              type: 'number',
              description: 'Number of existing changesets',
            },
            affectedPackages: {
              type: 'number',
              description: 'Number of affected packages',
            },
          },
          description: 'Preview details',
        },
      },
    },
    PublishStatus: {
      type: 'object',
      properties: {
        workingTreeClean: {
          type: 'boolean',
          description: 'Whether the working tree is clean',
        },
        hasChangesets: {
          type: 'boolean',
          description: 'Whether there are existing changesets',
        },
        changesetCount: {
          type: 'number',
          description: 'Number of existing changesets',
        },
        readyToPublish: {
          type: 'boolean',
          description: 'Whether the repository is ready to publish',
        },
      },
    },
    Pipeline: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Pipeline ID',
        },
        name: {
          type: 'string',
          description: 'Pipeline name',
        },
        status: {
          type: 'string',
          enum: ['queued', 'in_progress', 'completed', 'failed'],
          description: 'Current status of the pipeline',
        },
        conclusion: {
          type: 'string',
          enum: ['success', 'failure', 'cancelled', 'skipped'],
          description: 'Pipeline conclusion',
        },
        workflowName: {
          type: 'string',
          description: 'Associated workflow name',
        },
        runNumber: {
          type: 'number',
          description: 'Run number',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the pipeline was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the pipeline was last updated',
        },
        triggeredBy: {
          type: 'string',
          description: 'User who triggered the pipeline',
        },
      },
    },
    PipelineStatus: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['queued', 'in_progress', 'completed', 'failed'],
          description: 'Pipeline status to update',
        },
        conclusion: {
          type: 'string',
          enum: ['success', 'failure', 'cancelled', 'skipped'],
          description: 'Pipeline conclusion',
        },
        lastRunId: {
          type: 'string',
          description: 'Last workflow run ID',
        },
      },
    },
    AuditLog: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Audit log entry ID',
        },
        pipelineId: {
          type: 'string',
          description: 'Associated pipeline ID',
        },
        action: {
          type: 'string',
          description: 'Action performed',
        },
        status: {
          type: 'string',
          description: 'Status at the time of action',
        },
        actor: {
          type: 'string',
          description: 'User who performed the action',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'When the action occurred',
        },
        details: {
          type: 'object',
          description: 'Additional action details',
        },
      },
    },
    Workflow: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID',
        },
        name: {
          type: 'string',
          description: 'Workflow name',
        },
        path: {
          type: 'string',
          description: 'Path to workflow file',
        },
        state: {
          type: 'string',
          enum: ['active', 'deleted'],
          description: 'Workflow state',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the workflow was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the workflow was last updated',
        },
      },
    },
    WorkflowRun: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow run ID',
        },
        name: {
          type: 'string',
          description: 'Workflow run name',
        },
        workflowId: {
          type: 'string',
          description: 'Associated workflow ID',
        },
        headBranch: {
          type: 'string',
          description: 'Branch the workflow ran on',
        },
        headRef: {
          type: 'string',
          description: 'Git ref',
        },
        status: {
          type: 'string',
          enum: ['queued', 'in_progress', 'completed'],
          description: 'Run status',
        },
        conclusion: {
          type: 'string',
          enum: ['success', 'failure', 'cancelled', 'skipped', 'neutral'],
          description: 'Run conclusion',
        },
        runNumber: {
          type: 'number',
          description: 'Run number',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the run was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the run was last updated',
        },
      },
    },
    WorkflowRunDetail: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow run ID',
        },
        name: {
          type: 'string',
          description: 'Workflow run name',
        },
        workflowId: {
          type: 'string',
          description: 'Associated workflow ID',
        },
        status: {
          type: 'string',
          enum: ['queued', 'in_progress', 'completed'],
          description: 'Run status',
        },
        conclusion: {
          type: 'string',
          enum: ['success', 'failure', 'cancelled', 'skipped', 'neutral'],
          description: 'Run conclusion',
        },
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              status: { type: 'string' },
              conclusion: { type: 'string' },
              startedAt: { type: 'string', format: 'date-time' },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
          description: 'Jobs in the workflow run',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the run was created',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'When the run was last updated',
        },
      },
    },
    Error: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message',
        },
        message: {
          type: 'string',
          description: 'Detailed error message',
        },
        code: {
          type: 'string',
          description: 'Error code',
        },
      },
    },
  },
  responses: {
    UnauthorizedError: {
      description: 'Unauthorized access',
    },
    NotFoundError: {
      description: 'Resource not found',
    },
    InternalServerError: {
      description: 'Internal server error',
    },
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Enter your session token in the format: Bearer YOUR_SESSION_TOKEN',
    },
  },
};
