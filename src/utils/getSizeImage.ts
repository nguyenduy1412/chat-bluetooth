import { Image } from "react-native";

export const getSizeImage = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      base64,
      (width, height) => {
        const maxWidth = 300;
        const ratio = width / height;
        let imageWidth = width;
        let imageHeight = height;

        if (ratio > 1.2) {
          imageWidth = maxWidth;
          imageHeight = imageWidth / ratio;
        } else if (ratio === 1) {
          imageWidth = maxWidth - 30;
          imageHeight = maxWidth - 30;
        } else {
          imageWidth = Math.min(width, maxWidth - 60);
          imageHeight = imageWidth / ratio;
        }

        resolve({ width: imageWidth, height: imageHeight });
      },
      (error) => reject(error)
    );
  });
};
