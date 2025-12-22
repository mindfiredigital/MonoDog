/*
  Warnings:

  - The primary key for the `Commit` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commit" (
    "hash" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "Commit_hash_packageName_key" ON "Commit"("hash", "packageName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
