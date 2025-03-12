import { ImageData } from "../types/gallery";
import { ValidationError } from "../types/error";

export const validateImageData = (data: any): ImageData => {
  const errors: string[] = [];

  if (!data.url) {
    errors.push("Image URL is required");
  } else if (typeof data.url !== "string") {
    errors.push("Image URL must be a string");
  }

  if (data.caption && typeof data.caption !== "string") {
    errors.push("Caption must be a string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid image data", errors);
  }

  return {
    url: data.url,
    caption: data.caption,
  };
};
