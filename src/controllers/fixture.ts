import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../types/error";
import {
  createFixture,
  getFixtureById,
  getFixtures,
  updateMatchResult,
} from "../services/fixture.service";
import { FixtureData, MatchResult } from "../types/fixture";

export const addFixture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fixtureData: FixtureData = req.body;

    if (!fixtureData.opponent || !fixtureData.date || !fixtureData.venue) {
      throw new ValidationError("Opponent, date, and venue are required");
    }

    if (new Date(fixtureData.date) < new Date()) {
      throw new ValidationError("Cannot create fixtures for past dates");
    }

    const fixture = await createFixture(fixtureData);
    res.json(fixture);
  } catch (error) {
    next(error);
  }
};

export const listFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { upcoming } = req.query;
    const fixtures = await getFixtures(upcoming !== "true");
    res.json(fixtures);
  } catch (error) {
    next(error);
  }
};

export const recordMatchResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fixtureId } = req.params;
    const resultData: MatchResult = req.body;

    if (!resultData.result || !resultData.score) {
      throw new ValidationError("Result and score are required");
    }

    const fixture = await updateMatchResult(fixtureId, resultData);
    res.json(fixture);
  } catch (error) {
    next(error);
  }
};

// Add this function to the existing file
export const getSingleFixture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fixtureId } = req.params;

    if (!fixtureId) {
      throw new ValidationError("Fixture ID is required");
    }

    const fixture = await getFixtureById(fixtureId);
    res.json(fixture);
  } catch (error) {
    next(error);
  }
};
