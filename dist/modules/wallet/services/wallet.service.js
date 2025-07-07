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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const wallet_entity_1 = require("../entities/wallet.entity");
const transaction_entity_1 = require("../../transaction/entities/transaction.entity");
const transaction_type_enum_1 = require("../../transaction/enums/transaction-type.enum");
const redis_service_1 = require("../../../cache/redis.service");
let WalletService = class WalletService {
    walletRepo;
    txRepo;
    transactionQueue;
    redis;
    constructor(walletRepo, txRepo, transactionQueue, redis) {
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.transactionQueue = transactionQueue;
        this.redis = redis;
    }
    async createWallet(dto) {
        const existing = await this.walletRepo.findOne({
            where: { userId: dto.userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Wallet already exists for this user');
        }
        const wallet = this.walletRepo.create({
            userId: dto.userId,
            balance: dto.initialBalance ?? 0,
        });
        return this.walletRepo.save(wallet);
    }
    async enqueueDeposit(walletId, dto) {
        const existingTx = await this.txRepo.findOne({
            where: { transactionId: dto.transactionId },
        });
        if (existingTx) {
            throw new common_1.ConflictException('Duplicate transaction ID');
        }
        await this.txRepo.save({
            walletId,
            amount: dto.amount,
            type: transaction_type_enum_1.TransactionType.DEPOSIT,
            transactionId: dto.transactionId,
            status: 'pending',
        });
        await this.transactionQueue.add('deposit', {
            walletId,
            amount: dto.amount,
            transactionId: dto.transactionId,
        });
        return { message: 'Deposit scheduled for processing' };
    }
    async enqueueWithdraw(walletId, dto) {
        const existingTx = await this.txRepo.findOne({
            where: { transactionId: dto.transactionId },
        });
        if (existingTx) {
            throw new common_1.ConflictException('Duplicate transaction ID');
        }
        await this.txRepo.save({
            walletId,
            amount: dto.amount,
            type: transaction_type_enum_1.TransactionType.WITHDRAW,
            transactionId: dto.transactionId,
            status: 'pending',
        });
        await this.transactionQueue.add('withdraw', {
            walletId,
            amount: dto.amount,
            transactionId: dto.transactionId,
        });
        return { message: 'Withdrawal scheduled for processing' };
    }
    async transfer(dto) {
        const existing = await this.txRepo.findOne({
            where: { transactionId: dto.transactionId },
        });
        if (existing) {
            throw new common_1.ConflictException('Duplicate transaction ID');
        }
        await this.txRepo.save({
            walletId: dto.sourceWalletId,
            amount: dto.amount,
            type: transaction_type_enum_1.TransactionType.TRANSFER,
            transactionId: dto.transactionId,
            status: 'pending',
        });
        await this.transactionQueue.add('transfer', dto);
        return { message: 'Transfer scheduled for processing' };
    }
    async getTransactionHistory(walletId, page = 1, limit = 20) {
        const cacheKey = `wallet:txns:${walletId}:${page}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const [data, total] = await this.txRepo.findAndCount({
            where: { walletId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const result = {
            data: data.map((tx) => ({
                id: tx.id,
                amount: tx.amount,
                type: tx.type,
                status: tx.status,
                createdAt: tx.createdAt,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
        return result;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, bull_1.InjectQueue)('transactions')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, redis_service_1.RedisService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map