-- CreateTable
CREATE TABLE "Commit" (
    "hash" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "Commit_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
