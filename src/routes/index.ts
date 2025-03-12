import { Router } from "express";
import authRoutes from "./auth";
import attendanceRoutes from "./attendance";
import fixtureRoutes from "./fixture";
import galleryRoutes from "./gallery";
import playersRoutes from "./players";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/attendance", attendanceRoutes);
rootRouter.use("/fixture", fixtureRoutes);
rootRouter.use("/gallery", galleryRoutes);
rootRouter.use("/players", playersRoutes);

export default rootRouter;
