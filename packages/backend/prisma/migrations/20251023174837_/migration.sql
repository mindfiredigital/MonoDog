/*
  Warnings:

  - The primary key for the `Package` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Package` table. All the data in the column will be lost.

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
INSERT INTO "new_Package" ("createdAt", "dependencies", "dependenciesList", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version") SELECT "createdAt", "dependencies", "dependenciesList", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
