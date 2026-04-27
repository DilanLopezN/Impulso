import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum RankingPeriod {
  Weekly = 'weekly',
  Monthly = 'monthly',
  AllTime = 'all_time',
}

export enum RankingScope {
  Global = 'global',
  Friends = 'friends',
  Team = 'team',
}

export class ListRankingsQuery {
  @IsOptional()
  @IsEnum(RankingPeriod)
  period: RankingPeriod = RankingPeriod.Weekly;

  @IsOptional()
  @IsEnum(RankingScope)
  scope: RankingScope = RankingScope.Global;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
