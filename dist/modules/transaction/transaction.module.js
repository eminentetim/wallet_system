"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("../transaction/entities/transaction.entity");
const wallet_entity_1 = require("../wallet/entities/wallet.entity");
const wallet_module_1 = require("../wallet/wallet.module");
const redis_service_1 = require("../../cache/redis.service");
const transaction_processor_1 = require("../../jobs/workers/transaction.processor");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({ name: 'transactions' }),
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, wallet_entity_1.Wallet]),
            wallet_module_1.WalletModule,
        ],
        providers: [transaction_processor_1.TransactionProcessor, redis_service_1.RedisService],
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map