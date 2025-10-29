/*
  Warnings:

  - You are about to drop the column `packageHealthId` on the `Package` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dependencies" TEXT,
    "maintainers" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "repository" TEXT,
    "scripts" TEXT,
    "status" TEXT NOT NULL DEFAULT '',
    "devDependencies" TEXT,
    "peerDependencies" TEXT
);
INSERT INTO "new_Package" ("createdAt", "dependencies", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version") SELECT "createdAt", "dependencies", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
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
    CONSTRAINT "package_health_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_package_health" ("createdAt", "id", "packageBuildStatus", "packageDependencies", "packageLintStatus", "packageName", "packageOverallScore", "packageSecurity", "packageTestCoverage", "updatedAt") SELECT "createdAt", "id", "packageBuildStatus", "packageDependencies", "packageLintStatus", "packageName", "packageOverallScore", "packageSecurity", "packageTestCoverage", "updatedAt" FROM "package_health";
DROP TABLE "package_health";
ALTER TABLE "new_package_health" RENAME TO "package_health";
CREATE UNIQUE INDEX "package_health_packageName_key" ON "package_health"("packageName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
