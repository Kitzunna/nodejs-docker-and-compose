import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddItemsDto } from './dto/add-items.dto';

@Controller(['wishlists', 'wishlistlists'])
export class WishlistsController {
  constructor(private readonly wl: WishlistsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wl.findOne({ id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.wl.findMany({}, { order: { createdAt: 'DESC' } });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateWishlistDto,
  ) {
    const { itemsId, ...rest } = dto;
    const wl = await this.wl.createForOwner(user.userId, rest);
    if (itemsId?.length) {
      await this.wl.addItemsOwned(wl.id, user.userId, itemsId);
      return this.wl.findOne({ id: wl.id });
    }
    return wl;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wl.updateOwned(id, user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wl.removeOwned(id, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/items')
  addItems(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddItemsDto,
  ) {
    return this.wl.addItemsOwned(id, user.userId, dto.items);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/items/:wishId')
  removeItem(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Param('wishId', ParseIntPipe) wishId: number,
  ) {
    return this.wl.removeItemOwned(id, user.userId, wishId);
  }
}
