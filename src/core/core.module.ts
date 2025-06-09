import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Global()
@Module({
  imports: [],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CoreModule {}
