import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import {
  addFixture,
  getSingleFixture,
  listFixtures,
  recordMatchResult,
} from "../controllers/fixture";

const fixtureRoutes: Router = Router();

fixtureRoutes.post("/", [authMiddleware], errorHandler(addFixture));
fixtureRoutes.patch(
  "/:fixtureId/update",
  [authMiddleware],
  errorHandler(recordMatchResult)
);
fixtureRoutes.get("/", [authMiddleware], errorHandler(listFixtures));
fixtureRoutes.get(
  "/:fixtureId/result",
  [authMiddleware],
  errorHandler(getSingleFixture)
);

export default fixtureRoutes;
