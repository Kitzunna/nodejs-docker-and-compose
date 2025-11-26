import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HashService } from '../hash/hash.service';
import { WishesService } from '../wishes/wishes.service';
import { FindOptionsWhere } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly hash: HashService,
    private readonly wishes: WishesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@CurrentUser() user: { userId: number }) {
    return this.users.findOne({ id: user.userId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateMe(
    @CurrentUser() user: { userId: number },
    @Body() dto: UpdateUserDto,
  ) {
    if (dto.password) {
      dto.password = await this.hash.hash(dto.password);
    }
    return this.users.updateOne({ id: user.userId }, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/wishes')
  getMyWishes(@CurrentUser() user: { userId: number }) {
    const where: FindOptionsWhere<Wish> = {
      owner: { id: user.userId } as Partial<User> as User,
    };
    return this.wishes.findMany(where, { order: { createdAt: 'DESC' } });
  }

  @Post('find')
  findUsers(@Body('query') query: string) {
    return this.users.search(query);
  }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.users.findOne({ username });
  }

  @Get(':username/wishes')
  async getWishesByUsername(@Param('username') username: string) {
    const u = await this.users.findOne({ username });
    if (!u) return [];
    const where: FindOptionsWhere<Wish> = {
      owner: { id: u.id } as Partial<User> as User,
    };
    return this.wishes.findMany(where, { order: { createdAt: 'DESC' } });
  }
}
