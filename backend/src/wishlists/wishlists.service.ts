import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  DeepPartial,
  In,
} from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private readonly wlRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly itemRepo: Repository<WishlistItem>,
    @InjectRepository(Wish) private readonly wishRepo: Repository<Wish>,
  ) {}

  async create(dto: DeepPartial<Wishlist>): Promise<Wishlist> {
    const wl = this.wlRepo.create(dto);
    return this.wlRepo.save(wl);
  }

  async findMany(
    where: FindOptionsWhere<Wishlist> = {},
    options: Omit<FindManyOptions<Wishlist>, 'where'> = {},
  ): Promise<Wishlist[]> {
    return this.wlRepo.find({
      where,
      relations: { items: { wish: true }, owner: true },
      ...options,
    });
  }

  async findOne(where: FindOptionsWhere<Wishlist>): Promise<Wishlist | null> {
    return this.wlRepo.findOne({
      where,
      relations: { items: { wish: true }, owner: true },
    });
  }

  async updateOne(
    where: FindOptionsWhere<Wishlist>,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const existing = await this.wlRepo.findOne({ where });
    if (!existing) throw new NotFoundException('Wishlist not found');
    const merged = this.wlRepo.merge(existing, dto);
    return this.wlRepo.save(merged);
  }

  async removeOne(
    where: FindOptionsWhere<Wishlist>,
  ): Promise<{ deleted: true }> {
    const existing = await this.wlRepo.findOne({ where });
    if (!existing) throw new NotFoundException('Wishlist not found');
    await this.wlRepo.remove(existing); // каскадом удалятся items
    return { deleted: true };
  }

  async addItem(
    wishlistId: number,
    wishId: number,
    position = 0,
  ): Promise<WishlistItem> {
    const wl = await this.wlRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');

    const wishExists = await this.wishRepo.exist({ where: { id: wishId } });
    if (!wishExists) throw new NotFoundException(`Wish ${wishId} not found`);

    const duplicate = await this.itemRepo.findOne({
      where: { wishlist: { id: wishlistId }, wish: { id: wishId } },
    });
    if (duplicate) {
      throw new ConflictException(
        `Подарок ${wishId} уже есть в подборке ${wishlistId}`,
      );
    }

    const item = this.itemRepo.create({
      wishlist: { id: wishlistId } as Partial<Wishlist> as Wishlist,
      wish: { id: wishId } as Partial<Wish> as Wish,
      position,
    });
    return this.itemRepo.save(item);
  }

  async removeItem(
    wishlistId: number,
    wishId: number,
  ): Promise<{ deleted: true }> {
    const item = await this.itemRepo.findOne({
      where: { wishlist: { id: wishlistId }, wish: { id: wishId } },
    });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.remove(item);
    return { deleted: true };
  }

  private async assertOwner(
    wishlistId: number,
    userId: number,
  ): Promise<Wishlist> {
    const wl = await this.wlRepo.findOne({
      where: { id: wishlistId },
      relations: { owner: true },
    });
    if (!wl) throw new NotFoundException('Wishlist not found');
    if (wl.owner.id !== userId) {
      throw new ForbiddenException('Только владелец может изменять подборку');
    }
    return wl;
  }

  async createForOwner(
    ownerId: number,
    dto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const payload: DeepPartial<Wishlist> = {
      ...dto,
      owner: { id: ownerId } as Partial<User> as User,
    };
    return this.create(payload);
  }

  async updateOwned(
    id: number,
    ownerId: number,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    await this.assertOwner(id, ownerId);
    return this.updateOne({ id }, dto);
  }

  async removeOwned(id: number, ownerId: number): Promise<{ deleted: true }> {
    await this.assertOwner(id, ownerId);
    return this.removeOne({ id });
  }

  async addItemOwned(
    wishlistId: number,
    userId: number,
    wishId: number,
    position = 0,
  ): Promise<WishlistItem> {
    await this.assertOwner(wishlistId, userId);
    return this.addItem(wishlistId, wishId, position);
  }

  async addItemsOwned(
    wishlistId: number,
    userId: number,
    wishIds: number[],
  ): Promise<WishlistItem[]> {
    await this.assertOwner(wishlistId, userId);

    if (!Array.isArray(wishIds) || wishIds.length === 0) {
      throw new BadRequestException('Список items пуст');
    }

    const wishes = await this.wishRepo.find({ where: { id: In(wishIds) } });
    const foundIds = new Set(wishes.map((w) => w.id));
    const missing = wishIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new NotFoundException(`Подарки не найдены: ${missing.join(', ')}`);
    }

    const existing = await this.itemRepo.find({
      where: { wishlist: { id: wishlistId }, wish: { id: In(wishIds) } },
      relations: { wish: true },
    });
    if (existing.length) {
      const dupIds = existing.map((it) => it.wish.id);
      throw new ConflictException(
        `Эти подарки уже есть в подборке ${wishlistId}: ${dupIds.join(', ')}`,
      );
    }

    const entities = wishIds.map((wId, i) =>
      this.itemRepo.create({
        wishlist: { id: wishlistId } as Partial<Wishlist> as Wishlist,
        wish: { id: wId } as Partial<Wish> as Wish,
        position: i,
      }),
    );
    return this.itemRepo.save(entities);
  }

  async removeItemOwned(
    wishlistId: number,
    userId: number,
    wishId: number,
  ): Promise<{ deleted: true }> {
    await this.assertOwner(wishlistId, userId);
    return this.removeItem(wishlistId, wishId);
  }
}
