import { Queue } from 'bull';
import { TransferDto } from 'modules/wallet/dto/transfer.dto';
type TransactionPayload = {
    walletId: string;
    amount: number;
    transactionId: string;
};
export declare class TransactionQueue {
    private readonly queue;
    constructor(queue: Queue);
    enqueueDeposit(payload: TransactionPayload): Promise<void>;
    enqueueWithdraw(payload: TransactionPayload): Promise<void>;
    enqueueTransfer(payload: TransferDto): Promise<void>;
}
export {};
