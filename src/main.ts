import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard, ThrottlerStorageService } from '@nestjs/throttler';
import { UserThrottleGuard } from './common/guards/user-throttle.guard';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new UserThrottleGuard(app.get(ThrottlerStorageService)));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


const config = new DocumentBuilder()
  .setTitle('Wallet API')
  .setDescription('Secure Wallet API with deposits, withdrawals, and transfers')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
