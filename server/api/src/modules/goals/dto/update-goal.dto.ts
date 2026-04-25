import {
  IsEnum,
  IsHexColor,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import type { GoalFrequencyDto } from './create-goal.dto';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsISO8601()
  deadline?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetValue?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  targetUnit?: string | null;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'])
  frequency?: GoalFrequencyDto | null;
}
