"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    client;
    constructor() {
        this.client = new ioredis_1.Redis();
    }
    async get(cacheKey) {
        return this.client.get(cacheKey);
    }
    async set(cacheKey, value, mode, ttl) {
        return this.client.set(cacheKey, value, mode, ttl);
    }
    async setWalletBalance(walletId, balance) {
        await this.client.set(`wallet:balance:${walletId}`, balance.toString());
    }
    async getWalletBalance(walletId) {
        const balance = await this.client.get(`wallet:balance:${walletId}`);
        return balance ? parseFloat(balance) : null;
    }
    async invalidateBalance(walletId) {
        await this.client.del(`wallet:balance:${walletId}`);
    }
    async setTransactionPage(walletId, page, data) {
        await this.client.set(`wallet:txns:${walletId}:${page}`, JSON.stringify(data), 'EX', 60);
    }
    async getTransactionPage(walletId, page) {
        const data = await this.client.get(`wallet:txns:${walletId}:${page}`);
        return data ? JSON.parse(data) : null;
    }
    async invalidateTransactions(walletId) {
        const keys = await this.client.keys(`wallet:txns:${walletId}:*`);
        if (keys.length) {
            await this.client.del(...keys);
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map