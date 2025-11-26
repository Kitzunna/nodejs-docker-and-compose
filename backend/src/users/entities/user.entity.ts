import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30 })
  username: string; // 2..30 — проверим в DTO

  @Column({
    type: 'varchar',
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  about: string;

  @Column({
    type: 'varchar',
    length: 1024,
    default: 'https://i.pravatar.cc/300',
  })
  avatar: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner, { cascade: ['remove'] })
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user, { cascade: ['remove'] })
  offers: Offer[];

  @OneToMany(() => Wishlist, (wl) => wl.owner, { cascade: ['remove'] })
  wishlists: Wishlist[];
}
