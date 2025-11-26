// src/wishlists/wishlists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Wish } from '../wishes/entities/wish.entity'; // <-- добавили

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, WishlistItem, Wish])], // <-- добавили Wish
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [TypeOrmModule, WishlistsService],
})
export class WishlistsModule {}
