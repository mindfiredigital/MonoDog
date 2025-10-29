/*
  Warnings:

  - The primary key for the `DependencyInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DependencyInfo" (
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "latest" TEXT,
    "outdated" BOOLEAN NOT NULL DEFAULT false,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "DependencyInfo_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DependencyInfo" ("latest", "name", "outdated", "packageName", "status", "type", "version") SELECT "latest", "name", "outdated", "packageName", "status", "type", "version" FROM "DependencyInfo";
DROP TABLE "DependencyInfo";
ALTER TABLE "new_DependencyInfo" RENAME TO "DependencyInfo";
CREATE UNIQUE INDEX "DependencyInfo_name_packageName_key" ON "DependencyInfo"("name", "packageName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
