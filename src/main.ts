import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { serverConfig } from './config/main';

async function bootstrap() {
  const logger = new Logger('AuthenticationService');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: serverConfig.NATS_SERVERS,
      },
    },
  );

  await app.listen();
  logger.log('Authentication Microservice is now listening');
}

bootstrap();
