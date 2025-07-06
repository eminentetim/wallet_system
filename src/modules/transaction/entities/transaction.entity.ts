import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ unique: true })
  transactionId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'success' | 'failed';

  @Column({type: 'numeric'})
  balance?: number;

  @CreateDateColumn()
  createdAt: Date;
}
 



