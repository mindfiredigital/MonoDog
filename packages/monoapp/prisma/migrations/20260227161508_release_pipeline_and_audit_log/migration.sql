-- CreateTable
CREATE TABLE "PipelineAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "pipelineId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PipelineAuditLog_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "ReleasePipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReleasePipeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseVersion" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "workflowPath" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'manual',
    "triggeredBy" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL,
    "currentStatus" TEXT NOT NULL DEFAULT 'queued',
    "currentConclusion" TEXT,
    "lastRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PipelineAuditLog_pipelineId_idx" ON "PipelineAuditLog"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineAuditLog_userId_idx" ON "PipelineAuditLog"("userId");

-- CreateIndex
CREATE INDEX "PipelineAuditLog_action_idx" ON "PipelineAuditLog"("action");

-- CreateIndex
CREATE INDEX "PipelineAuditLog_timestamp_idx" ON "PipelineAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "ReleasePipeline_owner_repo_idx" ON "ReleasePipeline"("owner", "repo");

-- CreateIndex
CREATE INDEX "ReleasePipeline_packageName_idx" ON "ReleasePipeline"("packageName");

-- CreateIndex
CREATE INDEX "ReleasePipeline_triggeredAt_idx" ON "ReleasePipeline"("triggeredAt");
