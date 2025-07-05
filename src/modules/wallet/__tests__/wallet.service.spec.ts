// src/modules/wallet/services/wallet.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../services/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let repo: Repository<Wallet>;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    repo = module.get(getRepositoryToken(Wallet));
  });

  it('should create a wallet if none exists', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue({ userId: 'user-1', balance: 100 });
    mockRepo.save.mockResolvedValue({ id: 'wallet-1', userId: 'user-1', balance: 100 });

    const result = await service.createWallet({ userId: 'user-1', initialBalance: 100 });
    expect(result).toEqual({ id: 'wallet-1', userId: 'user-1', balance: 100 });
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should throw if user already has a wallet', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'wallet-1', userId: 'user-1' });
    await expect(service.createWallet({ userId: 'user-1' })).rejects.toThrow(ConflictException);
  });
});
