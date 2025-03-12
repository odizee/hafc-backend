-- DropForeignKey
ALTER TABLE `playerstats` DROP FOREIGN KEY `PlayerStats_fixtureId_fkey`;

-- DropIndex
DROP INDEX `PlayerStats_userId_fixtureId_key` ON `playerstats`;

-- AddForeignKey
ALTER TABLE `PlayerStats` ADD CONSTRAINT `PlayerStats_fixtureId_fkey` FOREIGN KEY (`fixtureId`) REFERENCES `Fixture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
