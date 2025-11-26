import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer) private readonly repo: Repository<Offer>,
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
    private readonly dataSource: DataSource,
    private readonly mail: MailService,
  ) {}

  findMany(
    where: FindOptionsWhere<Offer> = {},
    options: Omit<FindManyOptions<Offer>, 'where'> = {},
  ) {
    return this.repo.find({
      where,
      relations: { user: true, item: true },
      ...options,
    });
  }

  findOne(where: FindOptionsWhere<Offer>) {
    return this.repo.findOne({
      where,
      relations: { user: true, item: true },
    });
  }

  async createForUser(userId: number, dto: CreateOfferDto) {
    const { itemId, amount, hidden = false } = dto;

    return this.dataSource.transaction(async (manager) => {
      const wish = await manager
        .getRepository(Wish)
        .createQueryBuilder('w')
        .where('w.id = :id', { id: itemId })
        .setLock('pessimistic_write')
        .getOne();

      if (!wish) throw new NotFoundException('Wish not found');

      const wishWithOwner = await manager.findOne(Wish, {
        where: { id: itemId },
        relations: { owner: true },
      });

      if (wishWithOwner?.owner?.id === userId) {
        throw new ForbiddenException('Нельзя скидываться на свой подарок');
      }

      const remaining = Number((wish.price - wish.raised).toFixed(2));
      if (remaining <= 0) {
        throw new BadRequestException('Сбор уже завершён');
      }
      if (amount > remaining) {
        throw new BadRequestException(
          `Слишком большая сумма. Осталось собрать: ${remaining}`,
        );
      }

      const offer = manager.create(Offer, {
        amount,
        hidden,
        user: { id: userId } as Partial<User>,
        item: { id: itemId } as Partial<Wish>,
      });
      const saved = await manager.save(Offer, offer);

      wish.raised = Number((wish.raised + amount).toFixed(2));
      await manager.save(Wish, wish);

      const ownerEmail = wishWithOwner?.owner?.email;
      if (ownerEmail) {
        try {
          this.mail.sendOfferEmail(ownerEmail, {
            wishId: wish.id,
            amount,
            fromUser: String(userId),
          });
        } catch (err) {
          this.logger.warn(
            `Не удалось отправить письмо владельцу ${ownerEmail}: ${(err as Error).message}`,
          );
        }
      }

      return saved;
    });
  }
}
