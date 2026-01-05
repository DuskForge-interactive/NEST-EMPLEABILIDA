import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ListVacanciesDto {
  @IsOptional()
  @IsString()
  @Transform(trim)
  technology?: string;

  @IsOptional()
  @IsString()
  @Transform(trim)
  seniority?: string;
}
