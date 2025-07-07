import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(); 
  }

  async get(cacheKey: string): Promise<string | null> {
    return this.client.get(cacheKey);
  }

  async set(cacheKey: string, value: string, mode: 'EX', ttl: number): Promise<'OK'> {
    return this.client.set(cacheKey, value, mode, ttl);
  }

  async setWalletBalance(walletId: string, balance: number): Promise<void> {
    await this.client.set(`wallet:balance:${walletId}`, balance.toString());
  }

  async getWalletBalance(walletId: string): Promise<number | null> {
    const balance = await this.client.get(`wallet:balance:${walletId}`);
    return balance ? parseFloat(balance) : null;
  }

  async invalidateBalance(walletId: string): Promise<void> {
    await this.client.del(`wallet:balance:${walletId}`);
  }

  async setTransactionPage(walletId: string, page: number, data: any): Promise<void> {
    await this.client.set(`wallet:txns:${walletId}:${page}`, JSON.stringify(data), 'EX', 60);
  }

  async getTransactionPage(walletId: string, page: number): Promise<any | null> {
    const data = await this.client.get(`wallet:txns:${walletId}:${page}`);
    return data ? JSON.parse(data) : null;
  }

  async invalidateTransactions(walletId: string): Promise<void> {
    const keys = await this.client.keys(`wallet:txns:${walletId}:*`);
    if (keys.length) {
      await this.client.del(...keys);
    }
  }
}
