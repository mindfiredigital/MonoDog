/*
  Warnings:

  - You are about to drop the column `dependenciesCount` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Package` table. All the data in the column will be lost.
  - Added the required column `dependencies` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `license` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dependencies" TEXT NOT NULL,
    "maintainers" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "repository" TEXT,
    "scripts" TEXT,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "dependenciesList" TEXT,
    "devDependencies" TEXT
);
INSERT INTO "new_Package" ("createdAt", "dependenciesList", "description", "maintainers", "name", "path", "scripts", "status", "type", "updatedAt", "version") SELECT "createdAt", "dependenciesList", "description", "maintainers", "name", "path", "scripts", "status", "type", "updatedAt", "version" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
