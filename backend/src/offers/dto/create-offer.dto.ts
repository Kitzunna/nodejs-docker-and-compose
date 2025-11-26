import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  // id подарка (wish)
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  itemId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean; // по умолчанию false
}
