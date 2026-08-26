import { Inject, Injectable, BadRequestException } from "@nestjs/common";

import type { UploadApiResponse, v2 } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY")
    private readonly cloudinary: typeof v2,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException("Imagem não enviada.");
    }

    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: "tem-horario",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return reject(error);
          }

          if (!result) {
            return reject(new Error("Cloudinary não retornou o upload."));
          }

          resolve(result);
        },
      );

      upload.end(file?.buffer);
    });
  }
}
