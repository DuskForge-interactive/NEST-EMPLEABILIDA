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
}
