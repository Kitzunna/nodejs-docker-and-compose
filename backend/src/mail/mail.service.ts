import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  sendOfferEmail(
    to: string,
    payload: { wishId: number; amount: number; fromUser: string },
  ) {
    this.logger.log(
      `Mail to ${to}: offer ${payload.amount} for wish#${payload.wishId} from ${payload.fromUser}`,
    );
  }
}
