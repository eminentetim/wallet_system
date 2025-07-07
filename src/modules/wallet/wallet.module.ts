import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { WalletService } from './services/wallet.service';
import { WalletController } from './controllers/wallet.controller';
import { BullModule } from '@nestjs/bull';
import { RedisService } from '@/cache/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    BullModule.registerQueue({ name: 'transactions' }),
  ],
  providers: [WalletService, RedisService],
  controllers: [WalletController],
})
export class WalletModule {}

