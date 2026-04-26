import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import type { HabitFrequencyDto } from './create-habit.dto';

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string | null;

  @IsOptional()
  @IsHexColor()
  color?: string | null;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'CUSTOM'])
  frequency?: HabitFrequencyDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetPerWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  xpPerCheckin?: number;
}
