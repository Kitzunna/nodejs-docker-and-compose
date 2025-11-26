import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import type { User } from '../users/entities/user.entity';

type LocalUser = { id: number; username: string };
type ReqWithUser = ExpressRequest & { user: LocalUser };

function toSafeUser(u: User) {
  return {
    id: u.id,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    username: u.username,
    about: u.about,
    avatar: u.avatar,
  };
}

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.auth.signup(dto);
    return toSafeUser(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signin(@Request() req: ReqWithUser) {
    return this.auth.signin(req.user.id, req.user.username);
  }
}
