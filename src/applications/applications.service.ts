import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Application } from './application.entity';
import { Vacancy } from '../vacancies/vacancy.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(private readonly dataSource: DataSource) {}

  async applyToVacancy(vacancyId: string, coderId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const vacancy = await qr.manager.findOne(Vacancy, { where: { id: vacancyId } });
      if (!vacancy) throw new NotFoundException('Vacancy not found');

      const updateRes = await qr.manager
        .createQueryBuilder()
        .update(Vacancy)
        .set({ applicantsCount: () => `"applicantsCount" + 1` })
        .where(`id = :id`, { id: vacancyId })
        .andWhere(`"applicantsCount" < "maxApplicants"`)
        .execute();

      if ((updateRes.affected || 0) === 0) {
        throw new ConflictException('No capacity available');
      }

      const coder = await qr.manager.findOne(User, { where: { id: coderId } });
      if (!coder) throw new NotFoundException('Coder not found');

      const app = qr.manager.create(Application, { coder, vacancy });
      const saved = await qr.manager.save(app);

      await qr.commitTransaction();
      return saved;
    } catch (e: any) {
      await qr.rollbackTransaction();

      if (String(e?.message || '').includes('UQ_coder_vacancy')) {
        throw new ConflictException('Already applied');
      }
      throw e;
    } finally {
      await qr.release();
    }
  }

  async myApplications(coderId: string) {
    return this.dataSource.getRepository(Application).find({
      where: { coder: { id: coderId } as any },
      relations: { vacancy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async vacancyApplications(vacancyId: string) {
    const vacancyExists = await this.dataSource.getRepository(Vacancy).findOne({ where: { id: vacancyId } });
    if (!vacancyExists) throw new NotFoundException('Vacancy not found');

    return this.dataSource.getRepository(Application).find({
      where: { vacancy: { id: vacancyId } as any },
      relations: { coder: true },
      order: { createdAt: 'DESC' },
    });
  }

  async metrics() {
    const rows = await this.dataSource
      .getRepository(Vacancy)
      .createQueryBuilder('vacancy')
      .leftJoin('vacancy.applications', 'application')
      .select('vacancy.id', 'vacancyId')
      .addSelect('vacancy.title', 'title')
      .addSelect('COUNT(application.id)', 'applications')
      .groupBy('vacancy.id')
      .addGroupBy('vacancy.title')
      .orderBy('applications', 'DESC')
      .getRawMany();

    const byVacancy = rows.map((row) => ({
      vacancyId: row.vacancyId,
      title: row.title,
      applications: Number(row.applications || 0),
    }));

    const totalApplications = byVacancy.reduce((acc, item) => acc + item.applications, 0);

    return {
      totalApplications,
      byVacancy,
    };
  }
}
