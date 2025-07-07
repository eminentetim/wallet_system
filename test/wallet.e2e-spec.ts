
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { v4 as uuid4 } from 'uuid';
import request from 'supertest';


describe('Wallet Endpoints (e2e)', () => {
  let app: INestApplication;
  let server: any;

  let wallet1Id: string;
  let wallet2Id: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a wallet with an initial balance', async () => {
    const res = await request(server)
      .post('/wallets/create')
      .send({ userId: uuid4(), initialBalance: 1000 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.balance).toBe(1000);
    wallet1Id = res.body.id;
  });

  it('should create a second wallet with default balance', async () => {
    const res = await request(server)
      .post('/wallets/create')
      .send({ userId: uuid4() });

    expect(res.statusCode).toBe(201);
    expect(res.body.balance).toBe(0);
    wallet2Id = res.body.id;
  });

  it('should deposit funds into wallet safely', async () => {
    const res = await request(server)
      .post(`/wallets/${wallet1Id}/deposit`)
      .send({
        amount: 500,
        transactionId: uuid4(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain('Deposit scheduled');
  });

  it('should withdraw funds safely and prevent overdraft', async () => {
    const res = await request(server)
      .post(`/wallets/${wallet1Id}/withdraw`)
      .send({
        amount: 200,
        transactionId: uuid4(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain('Withdrawal scheduled');
  });

  it('should prevent overdraw', async () => {
    const res = await request(server)
      .post(`/wallets/${wallet2Id}/withdraw`)
      .send({
        amount: 999,
        transactionId: uuid4(),
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400); // e.g., 400 or 409
  });

  it('should transfer funds atomically and idempotently', async () => {
    const txId = uuid4();
    const res = await request(server)
      .post('/wallets/transfer')
      .send({
        sourceWalletId: wallet1Id,
        destinationWalletId: wallet2Id,
        amount: 100,
        transactionId: txId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain('Transfer scheduled');

    const retry = await request(server)
      .post('/wallets/transfer')
      .send({
        sourceWalletId: wallet1Id,
        destinationWalletId: wallet2Id,
        amount: 100,
        transactionId: txId, // same ID
      });

    expect(retry.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should fetch paginated transaction history', async () => {
    const res = await request(server)
      .get(`/wallets/${wallet1Id}/transactions?page=1&limit=10`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('limit');
  });
});
