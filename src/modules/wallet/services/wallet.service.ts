import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import { TransactionType } from '@/modules/transaction/enums/transaction-type.enum';
import { RedisService } from '@/cache/redis.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,

    @InjectQueue('transactions')
    private readonly transactionQueue: Queue,

    private readonly redis: RedisService,
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<Wallet> {
    const existing = await this.walletRepo.findOne({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException('Wallet already exists for this user');
    }

    const wallet = this.walletRepo.create({
      userId: dto.userId,
      balance: dto.initialBalance ?? 0,
    });

    return this.walletRepo.save(wallet);
  }

  async enqueueDeposit(walletId: string, dto: DepositDto): Promise<{ message: string }> {
    const existingTx = await this.txRepo.findOne({
      where: { transactionId: dto.transactionId },
    });

    if (existingTx) {
      throw new ConflictException('Duplicate transaction ID');
    }

    await this.txRepo.save({
      walletId,
      amount: dto.amount,
      type: TransactionType.DEPOSIT,
      transactionId: dto.transactionId,
      status: 'pending',
    });

    await this.transactionQueue.add('deposit', {
      walletId,
      amount: dto.amount,
      transactionId: dto.transactionId,
    });

    return { message: 'Deposit scheduled for processing' };
  }

  async enqueueWithdraw(walletId: string, dto: WithdrawDto): Promise<{ message: string }> {
    const existingTx = await this.txRepo.findOne({
      where: { transactionId: dto.transactionId },
    });

    if (existingTx) {
      throw new ConflictException('Duplicate transaction ID');
    }

    await this.txRepo.save({
      walletId,
      amount: dto.amount,
      type: TransactionType.WITHDRAW,
      transactionId: dto.transactionId,
      status: 'pending',
    });

    await this.transactionQueue.add('withdraw', {
      walletId,
      amount: dto.amount,
      transactionId: dto.transactionId,
    });

    return { message: 'Withdrawal scheduled for processing' };
  }

  async transfer(dto: TransferDto): Promise<{ message: string }> {
    const existing = await this.txRepo.findOne({
      where: { transactionId: dto.transactionId },
    });

    if (existing) {
      throw new ConflictException('Duplicate transaction ID');
    }

    await this.txRepo.save({
      walletId: dto.sourceWalletId,
      amount: dto.amount,
      type: TransactionType.TRANSFER,
      transactionId: dto.transactionId,
      status: 'pending',
    });

    await this.transactionQueue.add('transfer', dto);

    return { message: 'Transfer scheduled for processing' };
  }

  async getTransactionHistory(
    walletId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: any[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const cacheKey = `wallet:txns:${walletId}:${page}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const [data, total] = await this.txRepo.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      data: data.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60); // Cache for 60 seconds

    return result;
  }
}
