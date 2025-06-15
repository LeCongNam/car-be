import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly _cloudinarySvc: CloudinaryService, // Assuming CloudinaryService is imported from the core module
  ) {}

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  getPresignLink() {
    return this._cloudinarySvc.generatePresignUrl();
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
