// src/jobs/transaction.queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TransactionQueue } from './queues/transaction.queue';
import { TransactionProcessor } from './processors/transaction.processor';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { RedisService } from '@/cache/redis.service';
import { TransactionModule } from '@/modules/transaction/transaction.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transaction',
    }),
    WalletModule,
    TransactionModule,
  ],
  providers: [TransactionQueue, TransactionProcessor, RedisService],
  exports: [TransactionQueue],
})
export class TransactionQueueModule {}
