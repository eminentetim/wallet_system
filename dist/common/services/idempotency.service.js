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
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../modules/transaction/entities/transaction.entity");
let IdempotencyService = class IdempotencyService {
    txRepo;
    constructor(txRepo) {
        this.txRepo = txRepo;
    }
    async registerIfNew(transactionId, walletId, amount, type) {
        const existing = await this.txRepo.findOne({
            where: { transactionId },
        });
        if (existing) {
            throw new common_1.ConflictException('Duplicate transaction ID');
        }
        const tx = this.txRepo.create({
            walletId,
            transactionId,
            amount,
            type,
            status: 'pending',
        });
        await this.txRepo.save(tx);
    }
    async markSuccess(transactionId) {
        await this.txRepo.update({ transactionId }, { status: 'success' });
    }
    async markFailed(transactionId) {
        await this.txRepo.update({ transactionId }, { status: 'failed' });
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map