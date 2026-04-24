import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  refreshToken!: string;
}
