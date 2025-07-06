import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginateQueryDto } from 'src/common/dto/paginate-query.dto';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiBody({
    schema: {
      example: {
        userId: 'user-uuid',
        initialBalance: 1000,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Wallet successfully created' })
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit funds into a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet UUID' })
  @ApiBody({
    schema: {
      example: {
        amount: 500,
        transactionId: 'a478bf12-d8a2-49f7-b6cf-1234d27a16f0',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Deposit scheduled for processing' })
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.walletService.enqueueDeposit(id, dto);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw funds from a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet UUID' })
  @ApiBody({
    schema: {
      example: {
        amount: 100,
        transactionId: 'b478bf12-d8a2-49f7-b6cf-1234d27a16f0',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Withdrawal scheduled for processing' })
  withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.walletService.enqueueWithdraw(id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds between wallets' })
  @ApiBody({
    schema: {
      example: {
        sourceWalletId: 'uuid-1',
        destinationWalletId: 'uuid-2',
        amount: 100,
        transactionId: 'uuid-tx',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Transfer scheduled for processing' })
  async transfer(@Body() dto: TransferDto) {
    return this.walletService.enqueueTransfer(dto);
  }

  @Get(':id/transactions')
@ApiOperation({ summary: 'Get paginated transaction history' })
@ApiParam({ name: 'id', description: 'Wallet ID' })
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 20 })
async getTransactions(
  @Param('id') id: string,
  @Query() query: PaginateQueryDto,
) {
  return this.walletService.getTransactionHistory(id, query.page, query.limit);
}

}
