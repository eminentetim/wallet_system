// src/modules/wallet/services/wallet.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../services/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository, Transaction } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { TransactionQueue } from '@/jobs/queues/transaction.queue';



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


describe('WalletService - enqueueDeposit', () => {
  let service: WalletService;
  let txRepo: Repository<Transaction>;
  let queue: TransactionQueue;

  const mockTxRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockQueue = {
    enqueueDeposit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTxRepo,
        },
        {
          provide: TransactionQueue,
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    txRepo = module.get(getRepositoryToken(Transaction));
    queue = module.get(TransactionQueue);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should enqueue deposit if transactionId is new', async () => {
    mockTxRepo.findOne.mockResolvedValue(null);
    mockTxRepo.save.mockResolvedValue({}); // assume successful save

    await service.enqueueDeposit('wallet-id-123', {
      amount: 500,
      transactionId: 'txn-123',
    });

    expect(mockTxRepo.findOne).toHaveBeenCalledWith({
      where: { transactionId: 'txn-123' },
    });

    expect(mockTxRepo.save).toHaveBeenCalledWith({
      walletId: 'wallet-id-123',
      amount: 500,
      type: 'deposit',
      transactionId: 'txn-123',
      status: 'pending',
    });

    expect(mockQueue.enqueueDeposit).toHaveBeenCalledWith({
      walletId: 'wallet-id-123',
      amount: 500,
      transactionId: 'txn-123',
    });
  });

  it('should throw ConflictException if transaction already exists', async () => {
    mockTxRepo.findOne.mockResolvedValue({ id: 'existing-tx' });

    await expect(
      service.enqueueDeposit('wallet-id-123', {
        amount: 500,
        transactionId: 'txn-123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockQueue.enqueueDeposit).not.toHaveBeenCalled();
  });
});
