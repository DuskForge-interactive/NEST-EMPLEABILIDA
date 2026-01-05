import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ example: 'Backend NestJS Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Construir APIs REST usando NestJS y PostgreSQL.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['NestJS', 'TypeORM', 'PostgreSQL'], isArray: true, type: String })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technologies: string[];

  @ApiProperty({ example: 'Mid' })
  @IsString()
  @IsNotEmpty()
  seniority: string;

  @ApiProperty({ required: false, example: ['Trabajo en equipo', 'Comunicación'], isArray: true, type: String })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  softSkills?: string[];

  @ApiProperty({ example: 'Latam (remoto)' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Remoto' })
  @IsString()
  @IsNotEmpty()
  mode: string;

  @ApiProperty({ required: false, example: 'USD 4k - 5k' })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  maxApplicants: number;
}
