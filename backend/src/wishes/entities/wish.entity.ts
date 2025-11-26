import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('wishes')
export class Wish {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;

  @Index()
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 1024 })
  link: string;

  @Column({ type: 'varchar', length: 1024 })
  image: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  description?: string;

  // <-- было (offer) => offer.wish, стало (offer) => offer.item
  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @Column({ type: 'int', default: 0 })
  copied: number;

  @ManyToOne(() => Wish, (w) => w.copies, { nullable: true })
  copiedFrom?: Wish;

  @OneToMany(() => Wish, (w) => w.copiedFrom)
  copies?: Wish[];
}
