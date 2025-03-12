import { PrismaClient } from "@prisma/client";
import { ImageData } from "../types/gallery";
import { DatabaseError } from "../types/error";

const prisma = new PrismaClient();

export const uploadImage = async (data: ImageData) => {
  try {
    return await prisma.image.create({
      data: {
        url: data.url,
        caption: data.caption,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to upload image");
  }
};

export const getAllImages = async () => {
  try {
    return await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch images");
  }
};
