-- CreateTable
CREATE TABLE "package_health" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageName" TEXT NOT NULL,
    "packageOverallScore" REAL NOT NULL,
    "packageBuildStatus" TEXT NOT NULL,
    "packageTestCoverage" REAL,
    "packageLintStatus" TEXT NOT NULL,
    "packageSecurity" TEXT NOT NULL,
    "packageDependencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "package_health_packageName_key" ON "package_health"("packageName");
