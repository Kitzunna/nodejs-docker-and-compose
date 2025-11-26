import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  DeepPartial,
} from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly repo: Repository<Wish>,
    @InjectRepository(WishlistItem)
    private readonly wlItemRepo: Repository<WishlistItem>,
  ) {}

  create(dto: CreateWishDto) {
    const entity = this.repo.create(dto as DeepPartial<Wish>);
    entity.raised ??= 0;
    entity.copied ??= 0;
    return this.repo.save(entity);
  }

  findMany(
    where: FindOptionsWhere<Wish> = {},
    options: Omit<FindManyOptions<Wish>, 'where'> = {},
  ) {
    return this.repo.find({ where, ...options });
  }

  findOne(where: FindOptionsWhere<Wish>) {
    return this.repo.findOne({
      where,
      relations: { owner: true, offers: true },
    });
  }

  async updateOne(where: FindOptionsWhere<Wish>, dto: UpdateWishDto) {
    const existing = await this.repo.findOne({
      where,
      relations: { offers: true },
    });
    if (!existing) throw new NotFoundException('Wish not found');
    if (dto.price !== undefined && existing.offers?.length) {
      throw new BadRequestException(
        'Нельзя менять стоимость — уже есть офферы',
      );
    }
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async removeOne(where: FindOptionsWhere<Wish>) {
    const existing = await this.repo.findOne({
      where,
      relations: { offers: true },
    });
    if (!existing) throw new NotFoundException('Wish not found');

    if (existing.offers?.length) {
      throw new BadRequestException('Нельзя удалить подарок — есть офферы');
    }

    await this.wlItemRepo
      .createQueryBuilder()
      .delete()
      .where('wishId = :id', { id: existing.id })
      .execute();

    await this.repo.remove(existing);
    return { deleted: true };
  }

  async createForOwner(ownerId: number, dto: CreateWishDto) {
    const owner = new User();
    owner.id = ownerId;

    const entity = this.repo.create({
      ...(dto as DeepPartial<Wish>),
      owner,
      raised: 0,
      copied: 0,
    });

    return this.repo.save(entity);
  }

  async updateOwned(id: number, ownerId: number, dto: UpdateWishDto) {
    const wish = await this.repo.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Редактирование чужого подарка запрещено');
    return this.updateOne({ id }, dto);
  }

  async removeOwned(id: number, ownerId: number) {
    const wish = await this.repo.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== ownerId)
      throw new ForbiddenException('Удаление чужого подарка запрещено');
    return this.removeOne({ id });
  }

  async copyForUser(srcId: number, userId: number) {
    const src = await this.repo.findOne({ where: { id: srcId } });
    if (!src) throw new NotFoundException('Wish not found');

    const owner = new User();
    owner.id = userId;

    const copiedFrom = new Wish();
    copiedFrom.id = srcId;

    const copy = this.repo.create({
      name: src.name,
      link: src.link,
      image: src.image,
      price: src.price,
      description: src.description ?? undefined,
      owner,
      copiedFrom,
      raised: 0,
      copied: 0,
    } as DeepPartial<Wish>);

    const saved = await this.repo.save(copy);
    await this.repo.increment({ id: srcId }, 'copied', 1);
    return saved;
  }
}
