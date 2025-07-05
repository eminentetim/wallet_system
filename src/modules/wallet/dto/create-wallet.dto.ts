import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateWalletDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;
}


