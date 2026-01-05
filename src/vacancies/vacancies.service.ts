import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { MODALITY_MAP, normalize } from './modality.map';
import { ListVacanciesDto } from './dto/list-vacancies.dto';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly repo: Repository<Vacancy>,
  ) {}

  async create(dto: CreateVacancyDto) {
    const key = normalize(dto.mode);
    const dbMode = MODALITY_MAP[key];

    if (!dbMode) {
      throw new BadRequestException(`mode inválido: ${dto.mode}`);
    }

    const vacancy = this.repo.create({
      title: dto.title,
      description: dto.description,
      technologies: dto.technologies,
      seniority: String(dto.seniority),
      softSkills: dto.softSkills ?? [],
      location: dto.location,
      mode: dbMode,
      salaryRange: dto.salaryRange,
      company: dto.company,
      maxApplicants: dto.maxApplicants,
    });

    return this.repo.save(vacancy);
  }

  findAll(filters: ListVacanciesDto = {}) {
    const qb = this.repo.createQueryBuilder('vacancy').orderBy('vacancy.createdAt', 'DESC');

    if (filters.technology) {
      const techTerms = filters.technology
        .split(',')
        .map((term) => term.trim())
        .filter(Boolean);

      if (techTerms.length > 0) {
        const clauses: string[] = [];
        const params: Record<string, string> = {};

        techTerms.forEach((term, idx) => {
          const key = `tech${idx}`;
          clauses.push(`vacancy.technologies ILIKE :${key}`);
          params[key] = `%${term}%`;
        });

        qb.andWhere(`(${clauses.join(' OR ')})`, params);
      }
    }

    if (filters.seniority) {
      qb.andWhere('LOWER(vacancy.seniority) = LOWER(:seniority)', {
        seniority: filters.seniority.trim(),
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vacante no encontrada');
    return v;
  }

  async update(id: string, dto: UpdateVacancyDto) {
    if (dto.salaryRange && dto.salaryRange.length < 3) {
      throw new BadRequestException('salaryRange inválido');
    }

    const v = await this.findOne(id);

    if (dto.title !== undefined) v.title = dto.title;
    if (dto.description !== undefined) v.description = dto.description;
    if (dto.technologies !== undefined) v.technologies = dto.technologies;
    if (dto.seniority !== undefined) v.seniority = String(dto.seniority);
    if (dto.softSkills !== undefined) v.softSkills = dto.softSkills;
    if (dto.location !== undefined) v.location = dto.location;
    if (dto.mode !== undefined) {
      const key = normalize(dto.mode);
      const dbMode = MODALITY_MAP[key];

      if (!dbMode) {
        throw new BadRequestException(`mode inválido: ${dto.mode}`);
      }

      v.mode = dbMode;
    }
    if (dto.salaryRange !== undefined) v.salaryRange = dto.salaryRange;
    if (dto.company !== undefined) v.company = dto.company;
    if (dto.maxApplicants !== undefined) v.maxApplicants = dto.maxApplicants;

    return this.repo.save(v);
  }

  async remove(id: string) {
    const v = await this.findOne(id);
    await this.repo.remove(v);
    return { deleted: true };
  }
}
