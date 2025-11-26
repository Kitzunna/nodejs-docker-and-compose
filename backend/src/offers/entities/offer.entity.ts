import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
// связь идёт с Wish, но свойство в оффере называется item
import { Wish } from '../../wishes/entities/wish.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;

  @ManyToOne(() => User, (user) => user.offers, { onDelete: 'CASCADE' })
  user: User;

  // <-- переименовано: было wish, стало item
  @ManyToOne(() => Wish, (wish) => wish.offers, { onDelete: 'RESTRICT' })
  item: Wish;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount: number;

  @Column({ type: 'boolean', default: false })
  hidden: boolean;
}
