import { Repository } from 'typeorm';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TransactionType } from '@/modules/transaction/enums/transaction-type.enum';
export declare class IdempotencyService {
    private readonly txRepo;
    constructor(txRepo: Repository<Transaction>);
    registerIfNew(transactionId: string, walletId: string, amount: number, type: TransactionType): Promise<void>;
    markSuccess(transactionId: string): Promise<void>;
    markFailed(transactionId: string): Promise<void>;
}
