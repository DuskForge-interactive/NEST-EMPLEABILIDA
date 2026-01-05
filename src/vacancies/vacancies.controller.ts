import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ListVacanciesDto } from './dto/list-vacancies.dto';

@ApiTags('Vacancies')
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacancies: VacanciesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Vacante creada correctamente')
  @Post()
  create(@Body() dto: CreateVacancyDto) {
    return this.vacancies.create(dto);
  }

  @Get()
  @ResponseMessage('Listado de vacantes')
  @ApiQuery({
    name: 'technology',
    required: false,
    description: 'Filtra vacantes que incluyan una o varias tecnologías (separadas por coma).',
    example: 'NestJS,TypeORM',
  })
  @ApiQuery({
    name: 'seniority',
    required: false,
    description: 'Filtra vacantes por seniority (Junior, Mid, Senior, etc.).',
    example: 'Mid',
  })
  list(@Query() filters: ListVacanciesDto) {
    return this.vacancies.findAll(filters);
  }

  @Get(':id')
  @ResponseMessage('Detalle de vacante')
  get(@Param('id') id: string) {
    return this.vacancies.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Vacante actualizada correctamente')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVacancyDto) {
    return this.vacancies.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Vacante eliminada')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacancies.remove(id);
  }
}
