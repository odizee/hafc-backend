export interface ImageData {
  url: string;
  caption?: string;
}

export interface ImageResponse extends ImageData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
