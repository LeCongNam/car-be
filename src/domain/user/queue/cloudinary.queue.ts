import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CloudinaryService } from 'src/core/cloudinary';
import { UserRepository } from 'src/repositories/user.repository';

@Processor('cloudinary')
@Injectable()
export class CloudinaryQueue extends WorkerHost {
  private _logger = new Logger(CloudinaryQueue.name);

  constructor(
    private readonly _cloudinaryService: CloudinaryService,
    private readonly _userRepo: UserRepository,
  ) {
    super();
  }

  async process(job: Job<CloudinaryMoveAvatarPayload>): Promise<any> {
    const user = await this._userRepo.findOneBy({ id: job.data.userId });

    if (!user) {
      this._logger.error(`User not found with ID: ${job.data.userId}`);
      return;
    }

    const shortPath = this._cloudinaryService.getShortPathWithoutExt(
      'temporary',
      job.data.pathTemp,
    );

    if (shortPath) {
      const newShortPath = `avatars/${shortPath?.split('/').pop()}`;

      const mv = await this._cloudinaryService.moveFile(
        shortPath,
        newShortPath,
      );

      if (user?.avatar) {
        // Xóa ảnh cũ nếu có
        const oldAvatar = user.avatar;
        const oldShortPath = this._cloudinaryService.getShortPathWithoutExt(
          'avatars',
          oldAvatar,
        );
        if (oldShortPath) {
          await this._cloudinaryService.deleteFile(oldShortPath);
          this._logger.log(`Deleted old avatar: ${oldShortPath}`);
        }
      }

      user.avatar = mv.secure_url;
    }

    await this._userRepo.update(user.id, {
      avatar: user.avatar,
    });

    this._logger.log(
      `Moved avatar for user ${user.id} from ${job.data.pathTemp} to avatars/${this._cloudinaryService.getFileName(job.data.pathTemp)}`,
    );
  }
}

type CloudinaryMoveAvatarPayload = { userId: string; pathTemp: string };
