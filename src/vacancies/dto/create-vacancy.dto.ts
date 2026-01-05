import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVacancyDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsArray() @ArrayNotEmpty() @IsString({ each: true })
  technologies: string[];

  @IsString() @IsNotEmpty()
  seniority: string;

  @IsArray() @IsOptional() @IsString({ each: true })
  softSkills?: string[];

  @IsString() @IsNotEmpty()
  location: string;

  @IsString() @IsNotEmpty()
  mode: string;

  @IsOptional() @IsString()
  salaryRange?: string;

  @IsString() @IsNotEmpty()
  company: string;

  @IsInt() @Min(1)
  maxApplicants: number;
}
