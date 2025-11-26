import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const ROUNDS = 10;

@Injectable()
export class HashService {
  hash(plain: string) {
    return bcrypt.hash(plain, ROUNDS);
  }
  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
