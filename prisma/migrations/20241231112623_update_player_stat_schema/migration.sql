
ALTER TABLE `PlayerStats` DROP FOREIGN KEY `PlayerStats_fixtureId_fkey`;
ALTER TABLE `PlayerStats` DROP INDEX `PlayerStats_fixtureId_key`;
ALTER TABLE `PlayerStats` ADD UNIQUE `PlayerStats_userId_fixtureId_key` (`userId`, `fixtureId`);
ALTER TABLE `PlayerStats` 
ADD CONSTRAINT `PlayerStats_fixtureId_fkey`
FOREIGN KEY (`fixtureId`) REFERENCES `Fixture` (`id`) ON DELETE CASCADE;
