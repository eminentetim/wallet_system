import { TransactionType } from '../enums/transaction-type.enum';
export declare class Transaction {
    id: string;
    walletId: string;
    amount: number;
    type: TransactionType;
    transactionId: string;
    status: 'pending' | 'success' | 'failed';
    balance: number;
    createdAt: Date;
}
