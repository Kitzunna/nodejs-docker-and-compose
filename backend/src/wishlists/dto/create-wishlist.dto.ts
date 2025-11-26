import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] })
  image?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  itemsId?: number[];
}
