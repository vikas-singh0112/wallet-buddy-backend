/*
  Warnings:

  - A unique constraint covering the columns `[userId,categoryName,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_categoryName_type_key" ON "Category"("userId", "categoryName", "type");
