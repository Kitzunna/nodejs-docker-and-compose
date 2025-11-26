import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ILike } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(dto: Partial<User>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findMany(
    where: FindOptionsWhere<User> = {},
    options: Omit<FindManyOptions<User>, 'where'> = {},
  ) {
    return this.repo.find({ where, ...options });
  }

  async findOne(where: FindOptionsWhere<User>) {
    return this.repo.findOne({ where });
  }

  async findOneWithPassword(where: FindOptionsWhere<User>) {
    return this.repo
      .createQueryBuilder('u')
      .where(where)
      .addSelect('u.password')
      .getOne();
  }

  async updateOne(where: FindOptionsWhere<User>, dto: Partial<User>) {
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new NotFoundException('User not found');
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async removeOne(where: FindOptionsWhere<User>) {
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new NotFoundException('User not found');
    await this.repo.remove(existing);
    return { deleted: true };
  }

  async search(query: string) {
    return this.repo.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }
}
