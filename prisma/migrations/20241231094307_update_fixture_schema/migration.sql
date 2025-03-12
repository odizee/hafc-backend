/*
  Warnings:

  - A unique constraint covering the columns `[fixtureId]` on the table `PlayerStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fixtureId` to the `PlayerStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `playerstats` ADD COLUMN `fixtureId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PlayerStats_fixtureId_key` ON `PlayerStats`(`fixtureId`);

-- AddForeignKey
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_fixtureId_fkey` FOREIGN KEY (`fixtureId`) REFERENCES `Fixture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
