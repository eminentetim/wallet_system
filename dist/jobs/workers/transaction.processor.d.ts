import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Wallet } from '@/modules/wallet/entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TransferDto } from '@/modules/wallet/dto/transfer.dto';
import { DepositDto } from '@/modules/wallet/dto/deposit.dto';
import { RedisService } from '@/cache/redis.service';
export declare class TransactionProcessor {
    private readonly walletRepo;
    private readonly txRepo;
    private readonly redis;
    constructor(walletRepo: Repository<Wallet>, txRepo: Repository<Transaction>, redis: RedisService);
    transactionQueue: any;
    enqueueDeposit(walletId: string, dto: DepositDto): Promise<{
        message: string;
    }>;
    handleWithdraw(job: Job<{
        walletId: string;
        amount: number;
        transactionId: string;
    }>): Promise<void>;
    handleTransfer(job: Job<TransferDto>): Promise<void>;
}
