import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import { PaginateQueryDto } from '@/common/dto/paginate-query.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    createWallet(dto: CreateWalletDto): Promise<any>;
    deposit(id: string, dto: DepositDto): Promise<any>;
    withdraw(id: string, dto: WithdrawDto): Promise<any>;
    transfer(dto: TransferDto): Promise<any>;
    getTransactions(id: string, query: PaginateQueryDto): Promise<any>;
}
