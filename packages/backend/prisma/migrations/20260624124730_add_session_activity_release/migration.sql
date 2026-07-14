-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "login" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "userData" TEXT NOT NULL,
    "permission" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "activity_log_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scheduled_release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseVersion" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "triggeredBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "scheduled_release_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE INDEX "activity_log_packageName_timestamp_idx" ON "activity_log"("packageName", "timestamp");

-- CreateIndex
CREATE INDEX "scheduled_release_packageName_status_idx" ON "scheduled_release"("packageName", "status");
