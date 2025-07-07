import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TransactionQueueModule } from './jobs/transaction.queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 10,
          ttl: 60, 
        },
      ],
    }),

    BullModule.forRoot({
    redis: { host: 'localhost', port: 6379 },
  }),
  BullModule.registerQueue({ name: 'transactions' }),
    

    WalletModule,
    TransactionModule,
    TransactionQueueModule,
  ],

  providers: [
    AppService,

    //  Global Throttling Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

  controllers: [AppController],
})
export class AppModule {}
