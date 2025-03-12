import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import {
  getPlayer,
  listPlayers,
  removePlayer,
  removePlayers,
} from "../controllers/players";
import { errorHandler } from "../error-handler";
import { updatePlayer } from "../services/players.service";

const playersRoutes: Router = Router();

playersRoutes.get("/", [authMiddleware], errorHandler(listPlayers));
playersRoutes.patch(
  "/:playerId/update",
  [authMiddleware],
  errorHandler(updatePlayer)
);
playersRoutes.get("/:playerId", [authMiddleware], errorHandler(getPlayer));
playersRoutes.delete(
  "/:playerId",
  [authMiddleware],
  errorHandler(removePlayer)
);
playersRoutes.post(
  "/bulk-delete",
  [authMiddleware],
  errorHandler(removePlayers)
);

export default playersRoutes;
