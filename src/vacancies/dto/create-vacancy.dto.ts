import {
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

const LOCATIONS = ['Medellín', 'Barranquilla', 'Bogotá', 'Cartagena'] as const;

export class CreateVacancyDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technologies: string[];

  @IsInt()
  @Min(1)
  seniority: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  softSkills: string[];

  @IsIn(LOCATIONS as unknown as string[])
  location: (typeof LOCATIONS)[number];

  @IsString()
  @MinLength(3)
  mode: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsString()
  @MinLength(2)
  company: string;

  @IsInt()
  @Min(1)
  maxApplicants: number;
}
