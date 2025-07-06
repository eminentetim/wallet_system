// src/jobs/workers/transaction.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '@/modules/wallet/entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { RedisService } from '@/cache/redis.service';
import { TransferDto } from 'src/modules/wallet/dto/transfer.dto';
import { BadRequestException } from '@nestjs/common/exceptions';

@Processor('transactions')
export class TransactionProcessor {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    private redis: RedisService,
  ) {}

  @Process('deposit')
  async handleDeposit(job: Job<{ walletId: string; amount: number; transactionId: string }>) {
    const { walletId, amount, transactionId } = job.data;

    const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: 'pessimistic_write' }, // lock wallet row
      });

      if (!wallet) throw new Error('Wallet not found');

      wallet.balance = Number(wallet.balance) + Number(amount);
      await queryRunner.manager.save(wallet);

      await queryRunner.manager.update(
        Transaction,
        { transactionId },
        { status: 'success' },
      );

      await queryRunner.commitTransaction();

      // Invalidate Redis balance cache
      await this.redis.invalidateBalance(walletId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await this.txRepo.update(
        { transactionId },
        { status: 'failed' },
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
 @Process('withdraw')
async handleWithdraw(job: Job<{ walletId: string; amount: number; transactionId: string }>) {
  const { walletId, amount, transactionId } = job.data;

  const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const wallet = await queryRunner.manager.findOne(Wallet, {
      where: { id: walletId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) throw new Error('Wallet not found');

    if (Number(wallet.balance) < Number(amount)) {
      throw new Error('Insufficient funds');
    }

    wallet.balance = Number(wallet.balance) - Number(amount);
    await queryRunner.manager.save(wallet);

    await queryRunner.manager.update(
      Transaction,
      { transactionId },
      { status: 'success' },
    );

    await queryRunner.commitTransaction();
    await this.redis.invalidateBalance(walletId);
  } catch (error) {
    await queryRunner.rollbackTransaction();

    await this.txRepo.update({ transactionId }, { status: 'failed' });

    if (error.message === 'Insufficient funds') {
      throw new BadRequestException(error.message);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
}

@Process('transfer')
async handleTransfer(job: Job<TransferDto>) {
  const { sourceWalletId, destinationWalletId, amount, transactionId } = job.data;

  const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Lock in deterministic order to avoid deadlock
    const [firstId, secondId] =
      sourceWalletId < destinationWalletId
        ? [sourceWalletId, destinationWalletId]
        : [destinationWalletId, sourceWalletId];

    const wallets = await queryRunner.manager.findByIds(Wallet, [firstId, secondId], {
      lock: { mode: 'pessimistic_write' },
    });

    const sourceWallet = wallets.find(w => w.id === sourceWalletId);
    const destinationWallet = wallets.find(w => w.id === destinationWalletId);

    if (!sourceWallet || !destinationWallet) throw new Error('Wallet not found');
    if (sourceWallet.id === destinationWallet.id) throw new Error('Cannot transfer to same wallet');
    if (Number(sourceWallet.balance) < Number(amount)) throw new Error('Insufficient balance');

    sourceWallet.balance = Number(sourceWallet.balance) - Number(amount);
    destinationWallet.balance = Number(destinationWallet.balance) + Number(amount);

    await queryRunner.manager.save([sourceWallet, destinationWallet]);

    await queryRunner.manager.update(
      Transaction,
      { transactionId },
      { status: 'success' },
    );

    await queryRunner.commitTransaction();

    // Invalidate Redis caches
    await this.redis.invalidateBalance(sourceWalletId);
    await this.redis.invalidateBalance(destinationWalletId);
  } catch (error) {
    await queryRunner.rollbackTransaction();

    await this.txRepo.update(
      { transactionId },
      { status: 'failed' },
    );

    throw error;
  } finally {
    await queryRunner.release();
  }
}

}