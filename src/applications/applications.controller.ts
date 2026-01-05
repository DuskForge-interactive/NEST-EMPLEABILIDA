import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Applications')
@Controller()
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CODER)
  @ResponseMessage('Postulación registrada')
  @Post('vacancies/:id/apply')
  apply(@Param('id') vacancyId: string, @Req() req: any) {
    return this.apps.applyToVacancy(vacancyId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CODER)
  @ResponseMessage('Postulaciones del usuario')
  @Get('me/applications')
  myApplications(@Req() req: any) {
    return this.apps.myApplications(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Métricas de postulaciones')
  @Get('applications/metrics')
  metrics() {
    return this.apps.metrics();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Postulaciones de la vacante')
  @Get('vacancies/:id/applications')
  vacancyApplications(@Param('id') vacancyId: string) {
    return this.apps.vacancyApplications(vacancyId);
  }
}
