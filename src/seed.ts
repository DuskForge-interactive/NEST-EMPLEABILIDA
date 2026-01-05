import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';
import { Vacancy } from './vacancies/vacancy.entity';
import { Application } from './applications/application.entity';
import { Location, Mode, Role } from './common/enums';

type UserSeed = Pick<User, 'name' | 'email' | 'passwordHash' | 'role'>;
type VacancySeed = Pick<
  Vacancy,
  | 'title'
  | 'description'
  | 'technologies'
  | 'seniority'
  | 'softSkills'
  | 'location'
  | 'mode'
  | 'salaryRange'
  | 'company'
  | 'maxApplicants'
  | 'isActive'
>;

async function ensureUser(ds: DataSource, data: UserSeed) {
  const repo = ds.getRepository(User);
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) return existing;
  const entity = repo.create(data);
  return repo.save(entity);
}

async function ensureVacancy(ds: DataSource, data: VacancySeed) {
  const repo = ds.getRepository(Vacancy);
  const existing = await repo.findOne({
    where: { title: data.title, company: data.company },
  });
  if (existing) return existing;
  const entity = repo.create({
    ...data,
    applicantsCount: 0,
  });
  return repo.save(entity);
}

async function ensureApplication(ds: DataSource, vacancy: Vacancy, coder: User) {
  const repo = ds.getRepository(Application);
  const existing = await repo.findOne({
    where: {
      vacancy: { id: vacancy.id },
      coder: { id: coder.id },
    },
    relations: { vacancy: true, coder: true },
  });
  if (existing) return existing;

  const currentCount = await repo.count({ where: { vacancy: { id: vacancy.id } } });
  if (currentCount >= vacancy.maxApplicants) {
    throw new Error(`Vacancy "${vacancy.title}" has no slots available`);
  }

  const entity = repo.create({ vacancy, coder });
  const saved = await repo.save(entity);

  await ds.getRepository(Vacancy).update(vacancy.id, {
    applicantsCount: currentCount + 1,
  });

  return saved;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const dataSource = app.get(DataSource);

  try {
    const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD ?? 'Emplea#2025', 10);

    const gestor = await ensureUser(dataSource, {
      name: 'Gestor Empleabilidad',
      email: 'gestor@empleabilidad.com',
      passwordHash,
      role: Role.GESTOR,
    });

    const coderOne = await ensureUser(dataSource, {
      name: 'Coder Uno',
      email: 'coder1@empleabilidad.com',
      passwordHash,
      role: Role.CODER,
    });

    const coderTwo = await ensureUser(dataSource, {
      name: 'Coder Dos',
      email: 'coder2@empleabilidad.com',
      passwordHash,
      role: Role.CODER,
    });

    const backendVacancy = await ensureVacancy(dataSource, {
      title: 'Backend Node.js (NestJS)',
      description: 'Construir y mantener APIs REST en NestJS con PostgreSQL.',
      technologies: ['NestJS', 'TypeORM', 'PostgreSQL', 'JWT'],
      softSkills: ['Comunicación', 'Trabajo en equipo'],
      seniority: 'MID',
      location: Location.MEDELLIN,
      mode: Mode.HYBRID,
      salaryRange: '4.500.000 - 6.500.000 COP',
      company: 'PLENUM S.A.S.',
      maxApplicants: 3,
      isActive: true,
    });

    const frontendVacancy = await ensureVacancy(dataSource, {
      title: 'Frontend React Jr.',
      description: 'Implementar interfaces simples con React y TypeScript.',
      technologies: ['React', 'TypeScript', 'Tailwind'],
      softSkills: ['Atención al detalle', 'Comunicación'],
      seniority: 'JUNIOR',
      location: Location.BOGOTA,
      mode: Mode.REMOTE,
      salaryRange: '3.000.000 - 4.500.000 COP',
      company: 'ACME Labs',
      maxApplicants: 2,
      isActive: true,
    });

    await ensureApplication(dataSource, backendVacancy, coderOne);
    await ensureApplication(dataSource, backendVacancy, coderTwo);
    await ensureApplication(dataSource, frontendVacancy, coderOne);

    console.log('✅ Seed listo:', {
      gestor: gestor.email,
      coders: [coderOne.email, coderTwo.email],
      vacancies: [backendVacancy.title, frontendVacancy.title],
    });
  } catch (error) {
    console.error('❌ Seed falló:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('❌ Seed falló en bootstrap:', error);
  process.exit(1);
});
