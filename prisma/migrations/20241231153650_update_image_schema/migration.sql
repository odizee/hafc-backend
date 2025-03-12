/*
  Warnings:

  - You are about to drop the column `userId` on the `image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_userId_fkey`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `userId`;
