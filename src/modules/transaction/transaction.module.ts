import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletModule } from '../wallet/wallet.module';
import { RedisService } from '@/cache/redis.service';
import { TransactionProcessor } from '@/jobs/workers/transaction.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'transactions' }),
    TypeOrmModule.forFeature([Transaction, Wallet]),
    WalletModule, 
  ],
  providers: [TransactionProcessor, RedisService],
})
export class TransactionModule {}
