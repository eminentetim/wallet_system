import { IsUUID, IsNumber, Min, IsNotEmpty, IsPositive } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsUUID()
  transactionId: string;
}
