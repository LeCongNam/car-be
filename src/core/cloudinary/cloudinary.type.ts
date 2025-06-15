import { PresignResult } from './cloudinary.service';

export interface Cloudinary {
  generatePresignUrl(): PresignResult;
  deleteFile(publicId: string): Promise<void>;
  moveFile(publicIdOld: string, publicIdNew: string): Promise<void>;
  getFileUrl(publicId: string): string;
}
