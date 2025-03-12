import { Response, NextFunction, Request } from "express";
import { ValidationError } from "../types/error";
import {
  getPlayerById,
  getAllPlayers,
  updatePlayer,
  deletePlayer,
  bulkDeletePlayers,
} from "../services/players.service";

export const listPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const getPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerById(playerId);
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { playerId } = req.params;
    const player = await updatePlayer(playerId, req.body);
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const removePlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { playerId } = req.params;
    await deletePlayer(playerId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const removePlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ValidationError("userIds must be a non-empty array");
    }

    await bulkDeletePlayers(userIds);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
