import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TransferDto } from 'src/modules/wallet/dto/transfer.dto';

@Injectable()
export class TransactionQueue {
  constructor(@InjectQueue('transactions') private readonly queue: Queue) {}

  async enqueueDeposit(payload: { walletId: string; amount: number; transactionId: string }) {
    await this.queue.add('deposit', payload, {
      jobId: payload.transactionId, // idempotency at queue level too
    });
  }
  async enqueueWithdraw(payload: { walletId: string; amount: number; transactionId: string }) {
    await this.queue.add('withdraw', payload, {
      jobId: payload.transactionId,
    });
  }

  async enqueueTransfer(payload: TransferDto) {
  await this.queue.add('transfer', payload, {
    jobId: payload.transactionId,
    attempts: 3,
    backoff: 5000,
  });
}

   
}

