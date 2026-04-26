import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateCheckinDto {
  // YYYY-MM-DD (calendar date in the user's timezone). Defaults to "today"
  // server-side when omitted.
  @IsOptional()
  @Matches(ISO_DATE, { message: 'date must be a YYYY-MM-DD string' })
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}

export class DeleteCheckinQuery {
  @IsOptional()
  @Matches(ISO_DATE, { message: 'date must be a YYYY-MM-DD string' })
  date?: string;
}

/** Manual history adjustment with audit trail (RF habits 2.3). */
export class AdjustCheckinDto {
  @Matches(ISO_DATE, { message: 'date must be a YYYY-MM-DD string' })
  date!: string;

  // `true` to set the day as completed, `false` to remove the check-in.
  @IsBoolean()
  done!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  reason?: string;
}
