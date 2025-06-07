import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.set('trust proxy', true);
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT, () => {
    Logger.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
