import { IsUUID, IsNumber, Min, IsNotEmpty, IsPositive } from 'class-validator';

export class TransferDto {
  @IsUUID()
  sourceWalletId: string;

  @IsUUID()
  @IsNotEmpty()
  destinationWalletId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsUUID()
  transactionId: string;
}
