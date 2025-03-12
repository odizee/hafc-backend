import { PrismaClient } from "@prisma/client";
import { PlayerUpdateData } from "../types/players";
import { DatabaseError, NotFoundError } from "../types/error";

const prisma = new PrismaClient();

export const getAllPlayers = async () => {
  try {
    const players = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        positions: true,
        bio: true,
        stats: true,
        role: true,
      },
    });

    // Parse positions before sending the response
    const formattedPlayers = players.map((record) => ({
      ...record,
      positions: record.positions ? JSON.parse(record.positions) : [],
    }));

    return formattedPlayers;
  } catch (error) {
    throw new DatabaseError("Failed to fetch players");
  }
};

export const getPlayerById = async (userId: string) => {
  try {
    const player = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        positions: true,
        bio: true,
        stats: true,
        attendance: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    if (!player) {
      throw new NotFoundError("Player");
    }

    return player;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch player");
  }
};

export const updatePlayer = async (userId: string, data: PlayerUpdateData) => {
  try {
    console.log(data);
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        positions: true,
        bio: true,
        stats: true,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Player");
    }
    throw new DatabaseError("Failed to update player");
  }
};

export const deletePlayer = async (userId: string) => {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Player");
    }
    throw new DatabaseError("Failed to delete player");
  }
};

export const bulkDeletePlayers = async (userIds: string[]) => {
  try {
    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to delete players");
  }
};
