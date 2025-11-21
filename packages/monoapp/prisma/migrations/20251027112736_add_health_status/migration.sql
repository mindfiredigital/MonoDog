-- CreateTable
CREATE TABLE "health_status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageName" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "buildStatus" TEXT NOT NULL,
    "testCoverage" REAL NOT NULL,
    "lintStatus" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "dependencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "health_status_packageName_key" ON "health_status"("packageName");
