import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { Transaction } from '../modules/transaction/entities/transaction.entity';
import { WalletModule } from '../modules/wallet/wallet.module';
import { TransactionProcessor } from './workers/transaction.processor';
import { RedisService } from '@/cache/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    BullModule.registerQueue({ name: 'transactions' }),
    WalletModule,
  ],
  providers: [TransactionProcessor, RedisService],
})
export class TransactionQueueModule {}
