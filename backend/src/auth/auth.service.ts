import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

type PgError = Error & { code?: string; detail?: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly hash: HashService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: CreateUserDto) {
    const password = await this.hash.hash(dto.password);
    try {
      const user = await this.users.create({
        ...dto,
        password,
        about: dto.about ?? 'Пока ничего не рассказал о себе',
        avatar: dto.avatar ?? 'https://i.pravatar.cc/300',
      });
      return user;
    } catch (e) {
      const err = e as PgError;
      if (err.code === '23505') {
        throw new ConflictException('Email or username already exists');
      }
      throw e;
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.users.findOneWithPassword({ username });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.hash.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async signin(userId: number, username: string) {
    const token = await this.jwt.signAsync(
      { sub: userId, username },
      { expiresIn: process.env.JWT_TTL ?? '7d' },
    );
    return { access_token: token };
  }
}
