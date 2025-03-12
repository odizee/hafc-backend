import { Router } from "express";
import {
  bulkSendInvite,
  login,
  me,
  sendInvite,
  signup,
} from "../controllers/auth";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signup));
authRoutes.post("/login", errorHandler(login));
authRoutes.get("/me", [authMiddleware], errorHandler(me));
authRoutes.post("/send-invite", errorHandler(sendInvite));
authRoutes.post("/bulk-send-invite", errorHandler(bulkSendInvite));

export default authRoutes;
