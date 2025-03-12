import { Request, Response, NextFunction } from "express";
import { validateImageData } from "../validators/gallery";
import { getAllImages, uploadImage } from "../services/gallery.service";

export const addImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageData = validateImageData(req.body);
    const image = await uploadImage(imageData);
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

export const listImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const images = await getAllImages();
    res.json(images);
  } catch (error) {
    next(error);
  }
};
