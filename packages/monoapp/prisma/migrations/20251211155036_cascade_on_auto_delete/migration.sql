-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commit" (
    "hash" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME,
    "type" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "Commit_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Commit" ("author", "date", "hash", "message", "packageName", "type") SELECT "author", "date", "hash", "message", "packageName", "type" FROM "Commit";
DROP TABLE "Commit";
ALTER TABLE "new_Commit" RENAME TO "Commit";
CREATE TABLE "new_DependencyInfo" (
    "name" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "latest" TEXT,
    "outdated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DependencyInfo_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DependencyInfo" ("latest", "name", "outdated", "packageName", "status", "type", "version") SELECT "latest", "name", "outdated", "packageName", "status", "type", "version" FROM "DependencyInfo";
DROP TABLE "DependencyInfo";
ALTER TABLE "new_DependencyInfo" RENAME TO "DependencyInfo";
CREATE UNIQUE INDEX "DependencyInfo_name_packageName_key" ON "DependencyInfo"("name", "packageName");
CREATE TABLE "new_package_health" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageName" TEXT NOT NULL,
    "packageOverallScore" REAL NOT NULL,
    "packageBuildStatus" TEXT NOT NULL,
    "packageTestCoverage" REAL,
    "packageLintStatus" TEXT NOT NULL,
    "packageSecurity" TEXT NOT NULL,
    "packageDependencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "package_health_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_package_health" ("createdAt", "id", "packageBuildStatus", "packageDependencies", "packageLintStatus", "packageName", "packageOverallScore", "packageSecurity", "packageTestCoverage", "updatedAt") SELECT "createdAt", "id", "packageBuildStatus", "packageDependencies", "packageLintStatus", "packageName", "packageOverallScore", "packageSecurity", "packageTestCoverage", "updatedAt" FROM "package_health";
DROP TABLE "package_health";
ALTER TABLE "new_package_health" RENAME TO "package_health";
CREATE UNIQUE INDEX "package_health_packageName_key" ON "package_health"("packageName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
