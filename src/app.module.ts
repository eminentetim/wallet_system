import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';


BullModule.forRoot({
  redis: { host: 'localhost', port: 6379 },
}),
BullModule.registerQueue({ name: 'transactions' })

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,       
      limit: 10,      
    }),
    BullModule.forRoot({
  redis: { host: 'localhost', port: 6379 },
}),
BullModule.registerQueue({ name: 'transactions' })

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


