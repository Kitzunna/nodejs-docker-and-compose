import { PartialType } from '@nestjs/mapped-types';
import { CreateWishDto } from './create-wish.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional() @IsNumber() @Min(0) raised?: number;
}
