# 💰 Wallet System API (NestJS)

A production-grade **Wallet System API** built with [NestJS](https://nestjs.com/), supporting:
- Wallet creation
- Deposit, withdrawal, and transfer of funds
- Transaction idempotency
- Job queue processing with Bull
- Redis caching
- PostgreSQL as the data store

---

## 🧰 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Queue**: Bull (Redis)
- **Cache**: Redis
- **Testing**: Jest + Supertest
- **API Docs**: Swagger (OpenAPI)

---

## 🚀 Features

- ✅ Create wallet with optional initial balance
- ✅ Deposit & Withdraw with transaction queue
- ✅ Atomic and idempotent fund transfers
- ✅ Transaction history with pagination
- ✅ Redis-based caching
- ✅ Concurrency-safe processing
- ✅ Clean architecture with modules and services
- ✅ E2E and unit test support

---

## 📁 Project Structure


src/
├── app.module.ts
├── main.ts
├── modules/
│ ├── wallet/
│ │ ├── controllers/
│ │ ├── dto/
│ │ ├── entities/
│ │ ├── services/
│ │ └── wallet.module.ts
│ └── transaction/
│ ├── entities/
│ ├── enums/
│ └── transaction.module.ts
├── jobs/
│ └── workers/transaction.processor.ts
├── cache/
│ └── redis.service.ts
test/
├── app.e2e-spec.ts
└── wallet.e2e-spec.ts




---

## 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/etimeminent/wallet-system.git
cd wallet-system

# 2. Install dependencies
npm install

# 3. Setup PostgreSQL and Redis, then update your .env file
cp .env.example .env

# 4. Run migrations or sync schema
npm run migration:run
# or enable synchronize in ormconfig (not for production)

# 5. Start the app
npm run start:dev


🛠️ API Endpoints
Base URL: http://localhost:3000

➕ Create Wallet
http
Copy
Edit
POST /wallets/create
Body:

json
Copy
Edit
{
  "userId": "uuid-string",
  "initialBalance": 1000
}
💵 Deposit Funds
http
Copy
Edit
POST /wallets/:id/deposit
Body:

json
Copy
Edit
{
  "amount": 500,
  "transactionId": "unique-uuid"
}
💸 Withdraw Funds
http
Copy
Edit
POST /wallets/:id/withdraw
Body:

json
Copy
Edit
{
  "amount": 100,
  "transactionId": "unique-uuid"
}
🔁 Transfer Funds
http
Copy
Edit
POST /wallets/transfer
Body:

json
Copy
Edit
{
  "sourceWalletId": "uuid-1",
  "destinationWalletId": "uuid-2",
  "amount": 100,
  "transactionId": "unique-uuid"
}
📜 Get Transaction History
http
Copy
Edit
GET /wallets/:id/transactions?page=1&limit=10
📌 Swagger API Docs
Run the server and access the Swagger UI at:

bash
Copy
Edit
http://localhost:3000/api
⚙️ Job Processing (Bull Queue)
Jobs are dispatched for:

deposit

withdraw

transfer

You can monitor job queues using tools like Arena or Bull Board.

🧠 Concepts Implemented
Idempotency: Prevent duplicate processing via transactionId

Atomicity: Withdrawals and Transfers handled using QueryRunner

Concurrency Safety: Pessimistic locks for critical operations

Redis Cache: Paginated transaction history caching with TTL

Workers: Background processors handle actual fund updates

📈 Performance Tips
Set proper Redis eviction policies

Enable connection pooling for TypeORM

Use @CacheInterceptor for common GET routes

Monitor jobs for failures

👨‍💻 Contributing
Fork this repo

Create a feature branch: git checkout -b feature-name

Commit changes: git commit -m 'Add feature'

Push to branch: git push origin feature-name

Open a Pull Request

📝 License
This project is licensed under the MIT License.

📞 Contact
Developed by [Emem Etim] — Fullstack Developer
Email: etimeminent@gmail.com
Portfolio: https://v0-eminent-portfolio.vercel.app/