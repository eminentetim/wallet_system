import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Wallet } from '@/modules/wallet/entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TransferDto } from '@/modules/wallet/dto/transfer.dto';
import { DepositDto } from '@/modules/wallet/dto/deposit.dto';
import { TransactionType } from '@/modules/transaction/enums/transaction-type.enum';
import { RedisService } from '@/cache/redis.service';

@Injectable()
export class TransactionProcessor {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,

    private readonly redis: RedisService,
  ) {}

  transactionQueue: any;

  @Process('deposit')
  async enqueueDeposit(walletId: string, dto: DepositDto): Promise<{ message: string }> {
    const existingTx = await this.txRepo.findOne({
      where: { transactionId: dto.transactionId },
    });

    if (existingTx) {
      throw new ConflictException('Duplicate transaction ID');
    }

    const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + dto.amount;

    await this.txRepo.save({
      walletId,
      amount: dto.amount,
      type: TransactionType.DEPOSIT,
      transactionId: dto.transactionId,
      status: 'pending',
      balance: newBalance,
    });

    await this.transactionQueue.enqueueDeposit({
      walletId,
      amount: dto.amount,
      transactionId: dto.transactionId,
    });

    return { message: 'Deposit scheduled for processing' };
  }

  @Process('withdraw')
  async handleWithdraw(job: Job<{ walletId: string; amount: number; transactionId: string }>): Promise<void> {
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

      wallet.balance -= amount;
      await queryRunner.manager.save(wallet);

      await queryRunner.manager.update(Transaction, { transactionId }, { status: 'success' });

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
  async handleTransfer(job: Job<TransferDto>): Promise<void> {
    const { sourceWalletId, destinationWalletId, amount, transactionId } = job.data;

    const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [firstId, secondId] =
        sourceWalletId < destinationWalletId
          ? [sourceWalletId, destinationWalletId]
          : [destinationWalletId, sourceWalletId];

      const wallets = await queryRunner.manager.find(Wallet, {
        where: { id: In([firstId, secondId]) },
        lock: { mode: 'pessimistic_write' },
      });

      const sourceWallet = wallets.find(w => w.id === sourceWalletId);
      const destinationWallet = wallets.find(w => w.id === destinationWalletId);

      if (!sourceWallet || !destinationWallet) {
        throw new Error('Wallet not found');
      }

      if (sourceWallet.id === destinationWallet.id) {
        throw new Error('Cannot transfer to the same wallet');
      }

      if (Number(sourceWallet.balance) < Number(amount)) {
        throw new Error('Insufficient balance');
      }

      sourceWallet.balance -= amount;
      destinationWallet.balance += amount;

      await queryRunner.manager.save([sourceWallet, destinationWallet]);

      await queryRunner.manager.update(Transaction, { transactionId }, { status: 'success' });

      await queryRunner.commitTransaction();

      await this.redis.invalidateBalance(sourceWalletId);
      await this.redis.invalidateBalance(destinationWalletId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await this.txRepo.update({ transactionId }, { status: 'failed' });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
