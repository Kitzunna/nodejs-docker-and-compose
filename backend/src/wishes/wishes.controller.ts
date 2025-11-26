import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishes: WishesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  list() {
    return this.wishes.findMany({}, { order: { createdAt: 'DESC' } });
  }

  @Get('last')
  getLast() {
    return this.wishes.findMany({}, { order: { createdAt: 'DESC' }, take: 40 });
  }

  @Get('top')
  getTop() {
    return this.wishes.findMany({}, { order: { copied: 'DESC' }, take: 20 });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishes.findOne({ id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@CurrentUser() user: { userId: number }, @Body() dto: CreateWishDto) {
    return this.wishes.createForOwner(user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/copy')
  copy(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishes.copyForUser(id, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
  ) {
    const payload: Record<string, unknown> = { ...dto };
    if (Object.prototype.hasOwnProperty.call(payload, 'raised')) {
      delete (payload as { raised?: unknown }).raised;
    }
    return this.wishes.updateOwned(id, user.userId, payload as UpdateWishDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishes.removeOwned(id, user.userId);
  }
}
