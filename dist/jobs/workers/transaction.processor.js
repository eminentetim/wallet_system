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
exports.TransactionProcessor = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("../../modules/wallet/entities/wallet.entity");
const transaction_entity_1 = require("../../modules/transaction/entities/transaction.entity");
const deposit_dto_1 = require("../../modules/wallet/dto/deposit.dto");
const transaction_type_enum_1 = require("../../modules/transaction/enums/transaction-type.enum");
const redis_service_1 = require("../../cache/redis.service");
let TransactionProcessor = class TransactionProcessor {
    walletRepo;
    txRepo;
    redis;
    constructor(walletRepo, txRepo, redis) {
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.redis = redis;
    }
    transactionQueue;
    async enqueueDeposit(walletId, dto) {
        const existingTx = await this.txRepo.findOne({
            where: { transactionId: dto.transactionId },
        });
        if (existingTx) {
            throw new common_1.ConflictException('Duplicate transaction ID');
        }
        const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
        if (!wallet)
            throw new Error('Wallet not found');
        const newBalance = wallet.balance + dto.amount;
        await this.txRepo.save({
            walletId,
            amount: dto.amount,
            type: transaction_type_enum_1.TransactionType.DEPOSIT,
            transactionId: dto.transactionId,
            status: 'pending',
            balance: newBalance,
        });
        await this.transactionQueue.enqueueDeposit({
            walletId,
            amount: dto.amount,
            transactionId: dto.transactionId,
        });
        return { message: 'Deposit scheduled for processing' };
    }
    async handleWithdraw(job) {
        const { walletId, amount, transactionId } = job.data;
        const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const wallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { id: walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet)
                throw new Error('Wallet not found');
            if (Number(wallet.balance) < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            wallet.balance -= amount;
            await queryRunner.manager.save(wallet);
            await queryRunner.manager.update(transaction_entity_1.Transaction, { transactionId }, { status: 'success' });
            await queryRunner.commitTransaction();
            await this.redis.invalidateBalance(walletId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            await this.txRepo.update({ transactionId }, { status: 'failed' });
            if (error.message === 'Insufficient funds') {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async handleTransfer(job) {
        const { sourceWalletId, destinationWalletId, amount, transactionId } = job.data;
        const queryRunner = this.walletRepo.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const [firstId, secondId] = sourceWalletId < destinationWalletId
                ? [sourceWalletId, destinationWalletId]
                : [destinationWalletId, sourceWalletId];
            const wallets = await queryRunner.manager.find(wallet_entity_1.Wallet, {
                where: { id: (0, typeorm_2.In)([firstId, secondId]) },
                lock: { mode: 'pessimistic_write' },
            });
            const sourceWallet = wallets.find(w => w.id === sourceWalletId);
            const destinationWallet = wallets.find(w => w.id === destinationWalletId);
            if (!sourceWallet || !destinationWallet) {
                throw new Error('Wallet not found');
            }
            if (sourceWallet.id === destinationWallet.id) {
                throw new Error('Cannot transfer to the same wallet');
            }
            if (Number(sourceWallet.balance) < Number(amount)) {
                throw new Error('Insufficient balance');
            }
            sourceWallet.balance -= amount;
            destinationWallet.balance += amount;
            await queryRunner.manager.save([sourceWallet, destinationWallet]);
            await queryRunner.manager.update(transaction_entity_1.Transaction, { transactionId }, { status: 'success' });
            await queryRunner.commitTransaction();
            await this.redis.invalidateBalance(sourceWalletId);
            await this.redis.invalidateBalance(destinationWalletId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            await this.txRepo.update({ transactionId }, { status: 'failed' });
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TransactionProcessor = TransactionProcessor;
__decorate([
    (0, bull_1.Process)('deposit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deposit_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], TransactionProcessor.prototype, "enqueueDeposit", null);
__decorate([
    (0, bull_1.Process)('withdraw'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionProcessor.prototype, "handleWithdraw", null);
__decorate([
    (0, bull_1.Process)('transfer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionProcessor.prototype, "handleTransfer", null);
exports.TransactionProcessor = TransactionProcessor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], TransactionProcessor);
//# sourceMappingURL=transaction.processor.js.map