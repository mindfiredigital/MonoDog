/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Package` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dependencies" TEXT NOT NULL,
    "maintainers" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "repository" TEXT,
    "scripts" TEXT,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "dependenciesList" TEXT,
    "devDependencies" TEXT,
    "peerDependencies" TEXT
);
INSERT INTO "new_Package" ("createdAt", "dependencies", "dependenciesList", "description", "devDependencies", "id", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version") SELECT "createdAt", "dependencies", "dependenciesList", "description", "devDependencies", "id", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
