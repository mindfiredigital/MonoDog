/*
  Warnings:

  - A unique constraint covering the columns `[name,packageName]` on the table `DependencyInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DependencyInfo_name_packageName_key" ON "DependencyInfo"("name", "packageName");
