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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("../services/wallet.service");
const create_wallet_dto_1 = require("../dto/create-wallet.dto");
const deposit_dto_1 = require("../dto/deposit.dto");
const withdraw_dto_1 = require("../dto/withdraw.dto");
const transfer_dto_1 = require("../dto/transfer.dto");
const paginate_query_dto_1 = require("../../../common/dto/paginate-query.dto");
const swagger_1 = require("@nestjs/swagger");
let WalletController = class WalletController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    async createWallet(dto) {
        return this.walletService.createWallet(dto);
    }
    async deposit(id, dto) {
        return this.walletService.enqueueDeposit(id, dto);
    }
    async withdraw(id, dto) {
        return this.walletService.enqueueWithdraw(id, dto);
    }
    async transfer(dto) {
        return this.walletService.transfer(dto);
    }
    async getTransactions(id, query) {
        return this.walletService.getTransactionHistory(id, query.page, query.limit);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                userId: 'user-uuid',
                initialBalance: 1000,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet successfully created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wallet_dto_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Post)(':id/deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Deposit funds into a wallet' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Wallet UUID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                amount: 500,
                transactionId: 'a478bf12-d8a2-49f7-b6cf-1234d27a16f0',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Deposit scheduled for processing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deposit_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw funds from a wallet' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Wallet UUID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                amount: 100,
                transactionId: 'b478bf12-d8a2-49f7-b6cf-1234d27a16f0',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Withdrawal scheduled for processing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdraw_dto_1.WithdrawDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer funds between wallets' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                sourceWalletId: 'uuid-1',
                destinationWalletId: 'uuid-2',
                amount: 100,
                transactionId: 'uuid-tx',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transfer scheduled for processing' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_dto_1.TransferDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated transaction history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Wallet ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paginate_query_dto_1.PaginateQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallets'),
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map