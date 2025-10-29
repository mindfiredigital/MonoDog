/*
  Warnings:

  - You are about to alter the column `date` on the `Commit` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commit" (
    "hash" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "Commit_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Commit" ("author", "date", "hash", "message", "packageName", "type") SELECT "author", "date", "hash", "message", "packageName", "type" FROM "Commit";
DROP TABLE "Commit";
ALTER TABLE "new_Commit" RENAME TO "Commit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
