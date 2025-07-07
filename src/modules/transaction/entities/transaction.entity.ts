import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ unique: true })
  transactionId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'success' | 'failed';

  @Column({ nullable: true })
  balance: number;


  @CreateDateColumn()
  createdAt: Date;
}

 



