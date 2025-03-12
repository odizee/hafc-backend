import { PrismaClient } from "@prisma/client";
import { FixtureData, MatchResult } from "../types/fixture";
import { AppError, DatabaseError, NotFoundError } from "../types/error";

const prisma = new PrismaClient();

export const createFixture = async (data: FixtureData) => {
  try {
    return await prisma.fixture.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to create fixture");
  }
};

export const getFixtures = async (includeCompleted = true) => {
  try {
    const now = new Date();
    return await prisma.fixture.findMany({
      where: includeCompleted
        ? {}
        : {
            date: {
              gte: now,
            },
          },
      orderBy: { date: "asc" },
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch fixtures");
  }
};

export const updateMatchResult = async (
  fixtureId: string,
  resultData: MatchResult
) => {
  const { scorers, assists, cleanSheet, cards } = resultData;

  try {
    // Update fixture result
    const fixture = await prisma.$transaction(async (tx) => {
      // 1. Update fixture
      const updatedFixture = await tx.fixture.update({
        where: { id: fixtureId },
        data: {
          result: resultData.result,
          score: resultData.score,
        },
      });

      // 2. Update player stats for scorers
      if (scorers) {
        for (const scorer of scorers) {
          await tx.playerStats.upsert({
            where: { userId: scorer.playerId },
            create: {
              userId: scorer.playerId,
              goals: scorer.count,
              gamesPlayed: 1,
              fixtureId: fixtureId,
            },
            update: {
              goals: { increment: scorer.count },
              gamesPlayed: { increment: 1 },
            },
          });
        }
      }

      // 3. Update player stats for assists
      if (assists) {
        for (const assist of assists) {
          await tx.playerStats.upsert({
            where: { userId: assist.playerId },
            create: {
              userId: assist.playerId,
              assists: assist.count,
              gamesPlayed: 1,
              fixtureId: fixtureId,
            },
            update: {
              assists: { increment: assist.count },
              gamesPlayed: { increment: 1 },
            },
          });
        }
      }

      // 4. Update goalkeeper clean sheet
      if (cleanSheet) {
        await tx.playerStats.upsert({
          where: { userId: cleanSheet },
          create: {
            userId: cleanSheet,
            cleanSheets: 1,
            gamesPlayed: 1,
            fixtureId: fixtureId,
          },
          update: {
            cleanSheets: { increment: 1 },
            gamesPlayed: { increment: 1 },
          },
        });
      }

      // 5. Update cards
      if (cards) {
        for (const card of cards) {
          await tx.playerStats.upsert({
            where: { userId: card.playerId },
            create: {
              userId: card.playerId,
              yellowCards: card.type === "YELLOW" ? 1 : 0,
              redCards: card.type === "RED" ? 1 : 0,
              gamesPlayed: 1,
              fixtureId: fixtureId,
            },
            update: {
              yellowCards:
                card.type === "YELLOW" ? { increment: 1 } : undefined,
              redCards: card.type === "RED" ? { increment: 1 } : undefined,
              gamesPlayed: { increment: 1 },
            },
          });
        }
      }

      return updatedFixture;
    });

    return fixture;
  } catch (error) {
    throw new DatabaseError("Failed to update match result");
  }
};

// Add this function to the existing file
export const getFixtureById = async (fixtureId: string) => {
  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        PlayerStats: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                positions: true,
              },
            },
            goals: true,
            assists: true,
            cleanSheets: true,
            yellowCards: true,
            redCards: true,
          },
        },
      },
    });

    if (!fixture) {
      throw new NotFoundError("Fixture");
    }

    return fixture;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch fixture");
  }
};
