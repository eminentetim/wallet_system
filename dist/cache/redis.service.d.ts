export declare class RedisService {
    private readonly client;
    constructor();
    get(cacheKey: string): Promise<string | null>;
    set(cacheKey: string, value: string, mode: 'EX', ttl: number): Promise<'OK'>;
    setWalletBalance(walletId: string, balance: number): Promise<void>;
    getWalletBalance(walletId: string): Promise<number | null>;
    invalidateBalance(walletId: string): Promise<void>;
    setTransactionPage(walletId: string, page: number, data: any): Promise<void>;
    getTransactionPage(walletId: string, page: number): Promise<any | null>;
    invalidateTransactions(walletId: string): Promise<void>;
}
