import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entity';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wish, WishlistItem]),
  ],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [TypeOrmModule, WishesService],
})
export class WishesModule {}
