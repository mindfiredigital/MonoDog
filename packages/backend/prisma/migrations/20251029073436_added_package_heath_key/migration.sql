/*
  Warnings:

  - Added the required column `packageHealthId` to the `Package` table without a default value. This is not possible if the table is not empty.

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
    "peerDependencies" TEXT,
    "packageHealthId" INTEGER NOT NULL,
    CONSTRAINT "Package_packageHealthId_fkey" FOREIGN KEY ("packageHealthId") REFERENCES "package_health" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("createdAt", "dependencies", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version") SELECT "createdAt", "dependencies", "description", "devDependencies", "lastUpdated", "license", "maintainers", "name", "path", "peerDependencies", "repository", "scripts", "status", "type", "version" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
