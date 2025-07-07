import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import { RedisService } from '@/cache/redis.service';
export declare class WalletService {
    private readonly walletRepo;
    private readonly txRepo;
    private readonly transactionQueue;
    private readonly redis;
    constructor(walletRepo: Repository<Wallet>, txRepo: Repository<Transaction>, transactionQueue: Queue, redis: RedisService);
    createWallet(dto: CreateWalletDto): Promise<Wallet>;
    enqueueDeposit(walletId: string, dto: DepositDto): Promise<{
        message: string;
    }>;
    enqueueWithdraw(walletId: string, dto: WithdrawDto): Promise<{
        message: string;
    }>;
    transfer(dto: TransferDto): Promise<{
        message: string;
    }>;
    getTransactionHistory(walletId: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
