import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';

@Controller()
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CODER)
  @Post('vacancies/:id/apply')
  apply(@Param('id') vacancyId: string, @Req() req: any) {
    return this.apps.applyToVacancy(vacancyId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CODER)
  @Get('me/applications')
  myApplications(@Req() req: any) {
    return this.apps.myApplications(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GESTOR)
  @Get('vacancies/:id/applications')
  vacancyApplications(@Param('id') vacancyId: string) {
    return this.apps.vacancyApplications(vacancyId);
  }
}
