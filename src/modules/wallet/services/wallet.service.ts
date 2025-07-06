import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import { TransactionType } from 'src/modules/transaction/enums/transaction-type.enum';

@Injectable()
export class WalletService {
  enqueueDeposit: any;
  txRepo: any;
  transactionQueue: any;
    enqueueTransfer: any;
    redis: any;

  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
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

  async deposit(walletId: string, dto: DepositDto) {
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

    await this.transactionQueue.enqueueDeposit({
      walletId,
      amount: dto.amount,
      transactionId: dto.transactionId,
    });

    return { message: 'Deposit scheduled for processing' };
  }
  

  async enqueueWithdraw(walletId: string, dto: WithdrawDto) {
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

    await this.transactionQueue.enqueueWithdraw({
      walletId,
      amount: dto.amount,
      transactionId: dto.transactionId,
    });

    return { message: 'Withdrawal scheduled for processing' };
  }

  async Transfer(dto: TransferDto) {
  const existing = await this.txRepo.findOne({ where: { transactionId: dto.transactionId } });
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

  await this.transactionQueue.enqueueTransfer(dto);

  return {
    message: 'Transfer scheduled for processing',
  };
}


async getTransactionHistory(walletId: string, page: number, limit: number) {
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
    data: data.map(tx => ({
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

  await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60); // 60s TTL

  return result;
}

}



