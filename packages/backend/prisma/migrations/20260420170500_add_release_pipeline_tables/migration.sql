-- CreateTable
CREATE TABLE "release_pipeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseVersion" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "workflowPath" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "currentConclusion" TEXT,
    "lastRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pipeline_audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    CONSTRAINT "pipeline_audit_log_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "release_pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "release_pipeline_owner_repo_workflowId_triggeredAt_idx" ON "release_pipeline"("owner", "repo", "workflowId", "triggeredAt");

-- CreateIndex
CREATE INDEX "release_pipeline_releaseVersion_packageName_idx" ON "release_pipeline"("releaseVersion", "packageName");

-- CreateIndex
CREATE INDEX "pipeline_audit_log_pipelineId_timestamp_idx" ON "pipeline_audit_log"("pipelineId", "timestamp");

-- CreateIndex
CREATE INDEX "pipeline_audit_log_userId_timestamp_idx" ON "pipeline_audit_log"("userId", "timestamp");
