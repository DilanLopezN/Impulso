import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(1024)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z_]+\/[A-Za-z_\-+0-9]+$/, {
    message: 'timezone must be a valid IANA identifier (e.g. America/Sao_Paulo).',
  })
  timezone?: string;
}
