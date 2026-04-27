import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class EnvSchema {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  HOST: string = '0.0.0.0';

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  GO_WORKERS_BASE_URL?: string;

  @IsOptional()
  @IsString()
  GO_WORKERS_TOKEN?: string;

  @IsInt()
  @Min(10_000)
  @Max(86_400_000)
  GO_WORKERS_CRON_INTERVAL_MS: number = 300000;

  @IsInt()
  @Min(0)
  @Max(1)
  GO_WORKERS_CRON_ENABLED: number = 1;

  @IsString()
  @MinLength(16)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(16)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @Matches(/^\d+(s|m|h|d)$/, {
    message: 'JWT_ACCESS_TTL must match <number><s|m|h|d> (e.g. 15m, 1h).',
  })
  JWT_ACCESS_TTL: string = '15m';

  @IsInt()
  @Min(1)
  @Max(365)
  JWT_REFRESH_TTL_DAYS: number = 30;

  @IsInt()
  @Min(4)
  @Max(15)
  PASSWORD_HASH_ROUNDS: number = 12;
}

export function validateEnv(raw: Record<string, unknown>): EnvSchema {
  const parsed = plainToInstance(EnvSchema, raw, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(parsed, { skipMissingProperties: false });
  if (errors.length > 0) {
    const formatted = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${formatted}`);
  }

  return parsed;
}
