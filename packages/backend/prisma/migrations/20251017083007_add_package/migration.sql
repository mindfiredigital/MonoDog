-- CreateTable
CREATE TABLE "Package" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dependenciesCount" INTEGER NOT NULL,
    "maintainers" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "scripts" TEXT,
    "dependenciesList" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
