import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TransactionType } from '@/modules/transaction/enums/transaction-type.enum';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  /**
   * Registers a transaction only if it doesn't exist
   * @throws ConflictException if transactionId already processed or pending
   */
  async registerIfNew(
    transactionId: string,
    walletId: string,
    amount: number,
    type: TransactionType,
  ) {
    const existing = await this.txRepo.findOne({
      where: { transactionId },
    });

    if (existing) {
      throw new ConflictException('Duplicate transaction ID');
    }

    const tx = this.txRepo.create({
      walletId,
      transactionId,
      amount,
      type,
      status: 'pending',
    });

    await this.txRepo.save(tx);
  }

  /**
   * Mark transaction as success
   */
  async markSuccess(transactionId: string) {
    await this.txRepo.update({ transactionId }, { status: 'success' });
  }

  /**
   * Mark transaction as failed
   */
  async markFailed(transactionId: string) {
    await this.txRepo.update({ transactionId }, { status: 'failed' });
  }
}
