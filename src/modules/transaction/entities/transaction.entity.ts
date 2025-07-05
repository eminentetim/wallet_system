// src/modules/transaction/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column()
  type: 'deposit'; // Extend for withdraw/transfer later

  @Column({ unique: true })
  transactionId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'success' | 'failed';

  @CreateDateColumn()
  createdAt: Date;
}
 
