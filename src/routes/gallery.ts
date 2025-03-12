import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { addImage, listImages } from "../controllers/gallery";

const galleryRoutes: Router = Router();

galleryRoutes.post("/", [authMiddleware], errorHandler(addImage));
galleryRoutes.get("/", [authMiddleware], errorHandler(listImages));

export default galleryRoutes;
