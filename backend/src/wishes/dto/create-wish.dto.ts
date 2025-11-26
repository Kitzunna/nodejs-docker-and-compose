import {
  IsString,
  IsUrl,
  Length,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsUrl({ protocols: ['http', 'https'] }) // добавил проверку для http и https
  link: string;

  @IsString()
  @IsUrl({ protocols: ['http', 'https'] }) // добавил проверку для http и https
  image: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  @Length(1, 1024)
  description?: string;

  @IsOptional()
  owner?: any; // пока так
}
