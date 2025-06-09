// src/services/CloudinaryService.ts
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface PresignResult {
  uploadUrl: string; // URL mà client POST file lên
  fields: {
    // Các field cần gửi kèm
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
  };
}

@Injectable()
export class CloudinaryService {
  private _cloudinary = cloudinary;
  private _logger = new Logger(CloudinaryService.name);

  constructor() {
    this._cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
  }

  /**
   * Tạo presigned URL để client upload trực tiếp lên Cloudinary.
   * @param folder Thư mục muốn lưu trên Cloudinary
   */
  public generatePresignUrl(): PresignResult {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'temporary';

    // Các options cơ bản, bạn có thể thêm folder, resource_type, v.v.
    const paramsToSign = {
      timestamp,
      folder,
    };

    // Tạo signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    // URL upload
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`;

    return {
      uploadUrl,
      fields: {
        api_key: process.env.CLOUDINARY_API_KEY!,
        timestamp,
        signature,
        folder,
      },
    };
  }

  /**
   * Move (rename) một file đã upload.
   * @param publicIdOld public_id hiện tại (có thể kèm folder)
   * @param publicIdNew public_id mới (có thể kèm folder mới)
   */
  public async moveFile(
    publicIdOld: string,
    publicIdNew: string,
  ): Promise<Record<string, any>> {
    // overwrite: true để ghi đè nếu đã có file trùng public_id mới
    try {
      return this._cloudinary.uploader.rename(publicIdOld, publicIdNew, {
        overwrite: true,
      });
    } catch (error) {
      this._logger.error(
        `Error moving file from ${publicIdOld} to ${publicIdNew}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Xóa file khỏi Cloudinary.
   * @param publicId public_id của file cần xóa
   * @param resourceType (optional) default là 'image'
   */
  public async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'image',
  ): Promise<void> {
    try {
      const result = await this._cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      this._logger.log(
        `File ${publicId} deleted successfully: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this._logger.error(`Error deleting file ${publicId}: ${error}`);
      throw error;
    }
  }

  // ex : temporary/abcd
  getShortPathWithoutExt(folderName: string, fileUrl: string): string | null {
    const idx = fileUrl.indexOf(`/${folderName}/`);
    if (idx === -1) return null;

    const pathWithExt = fileUrl.slice(idx + 1); // remove leading "/"
    const dotIndex = pathWithExt.lastIndexOf('.');
    return dotIndex !== -1 ? pathWithExt.slice(0, dotIndex) : pathWithExt;
  }

  getShortPath(folderName: string, fileUrl: string): string | null {
    const idx = fileUrl.indexOf(`/${folderName}/`);
    if (idx === -1) return null;

    return fileUrl.slice(idx + 1);
  }

  /**
   * Extracts the filename with extension from a file URL
   * @param fileUrl The complete file URL
   * @returns The filename with extension or null if invalid URL
   */
  getFileName(fileUrl: string): string | null {
    if (!fileUrl) return null;

    // Find the last slash in the URL
    const lastSlashIndex = fileUrl.lastIndexOf('/');
    if (lastSlashIndex === -1) return null;

    // Return everything after the last slash
    return fileUrl.slice(lastSlashIndex + 1);
  }
}
