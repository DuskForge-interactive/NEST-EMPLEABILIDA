import { Controller, Get, Param } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacancies: VacanciesService) {}

  @Get()
  list() {
    return this.vacancies.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.vacancies.findOne(id);
  }
}
