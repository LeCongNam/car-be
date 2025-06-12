import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Tạo HTTP app

  // Gắn Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9094'],
      },
      consumer: {
        groupId: 'nestjs-group-server',
        allowAutoTopicCreation: true,
      },
    },
  });

  app.enableCors();
  // app.set('trust proxy', true);
  app.setGlobalPrefix('api');

  // Start Kafka microservice
  await app.startAllMicroservices();

  // Start HTTP server
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  Logger.log(`HTTP Server is running on port ${PORT}`);
}
bootstrap();
