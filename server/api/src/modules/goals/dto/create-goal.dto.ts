import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsHexColor,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export type GoalTypeDto = 'HABIT' | 'DEADLINE' | 'NUMERIC' | 'PROJECT';
export type GoalFrequencyDto = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export class CreateMilestoneItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  xp?: number;
}

export class CreateGoalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsEnum(['HABIT', 'DEADLINE', 'NUMERIC', 'PROJECT'])
  type!: GoalTypeDto;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsISO8601()
  deadline?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetValue?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  targetUnit?: string;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'])
  frequency?: GoalFrequencyDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneItemDto)
  milestones?: CreateMilestoneItemDto[];
}
