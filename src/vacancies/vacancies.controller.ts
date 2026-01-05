import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacancies: VacanciesService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.GESTOR)
  @Post()
  create(@Body() dto: CreateVacancyDto) {
    return this.vacancies.create(dto);
  }

  @Get()
  list() {
    return this.vacancies.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.vacancies.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.GESTOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVacancyDto) {
    return this.vacancies.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.GESTOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacancies.remove(id);
  }
}
