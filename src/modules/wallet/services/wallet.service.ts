import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { CreateWalletDto } from '../dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<Wallet> {
    const existing = await this.walletRepo.findOne({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException('Wallet already exists for this user');
    }

    const wallet = this.walletRepo.create({
      userId: dto.userId,
      balance: dto.initialBalance ?? 0,
    });

    return this.walletRepo.save(wallet);
  }
}
