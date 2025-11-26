import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemsDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  items: number[]; // массив id подарков (wishes) для добавления
}
