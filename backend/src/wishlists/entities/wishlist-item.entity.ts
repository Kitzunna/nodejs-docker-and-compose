import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity('wishlist_items')
@Unique(['wishlist', 'wish'])
export class WishlistItem {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => Wishlist, (wl) => wl.items, { onDelete: 'CASCADE' })
  wishlist: Wishlist;

  @ManyToOne(() => Wish, { onDelete: 'CASCADE' })
  wish: Wish;

  @Column({ type: 'int', default: 0 })
  position: number;
}
