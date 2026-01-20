-- CreateTable
CREATE TABLE "Commit" (
    "hash" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME,
    "type" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    CONSTRAINT "Commit_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DependencyInfo" (
    "name" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "latest" TEXT,
    "outdated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DependencyInfo_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "health_status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageName" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "buildStatus" TEXT NOT NULL,
    "testCoverage" REAL NOT NULL,
    "lintStatus" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "dependencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "package_health" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "packageName" TEXT NOT NULL,
    "packageOverallScore" REAL NOT NULL,
    "packageBuildStatus" TEXT NOT NULL,
    "packageTestCoverage" REAL,
    "packageLintStatus" TEXT NOT NULL,
    "packageSecurity" TEXT NOT NULL,
    "packageDependencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "package_health_packageName_fkey" FOREIGN KEY ("packageName") REFERENCES "Package" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Package" (
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
    "peerDependencies" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Commit_hash_packageName_key" ON "Commit"("hash", "packageName");

-- CreateIndex
CREATE UNIQUE INDEX "DependencyInfo_name_packageName_key" ON "DependencyInfo"("name", "packageName");

-- CreateIndex
CREATE UNIQUE INDEX "health_status_packageName_key" ON "health_status"("packageName");

-- CreateIndex
CREATE UNIQUE INDEX "package_health_packageName_key" ON "package_health"("packageName");

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
