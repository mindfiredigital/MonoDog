-- CreateTable
CREATE TABLE "DependencyInfo" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'dependency',
    "latest" TEXT,
    "outdated" BOOLEAN NOT NULL DEFAULT false,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "DependencyInfo_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DependencyInfo_name_key" ON "DependencyInfo"("name");
