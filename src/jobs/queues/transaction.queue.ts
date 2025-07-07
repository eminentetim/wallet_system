import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TransferDto } from 'modules/wallet/dto/transfer.dto';

type TransactionPayload = {
  walletId: string;
  amount: number;
  transactionId: string;
};

@Injectable()
export class TransactionQueue {
  constructor(
    @InjectQueue('transactions')
    private readonly queue: Queue,
  ) {}

  async enqueueDeposit(payload: TransactionPayload): Promise<void> {
    await this.queue.add('deposit', payload, {
      jobId: payload.transactionId,
    });
  }

  async enqueueWithdraw(payload: TransactionPayload): Promise<void> {
    await this.queue.add('withdraw', payload, {
      jobId: payload.transactionId,
    });
  }

  async enqueueTransfer(payload: TransferDto): Promise<void> {
    await this.queue.add('transfer', payload, {
      jobId: payload.transactionId,
      attempts: 3,
      backoff: 5000, // exponential backoff retry after 5 seconds
    });
  }
}
