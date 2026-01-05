import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';

type SeedUser = { name: string; email: string; password: string; role: UserRole };

async function upsertUser(repo: Repository<User>, data: SeedUser) {
  const existing = await repo.findOne({ where: { email: data.email } });

  if (existing) {
    return { created: false, email: data.email };
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user = repo.create({
    name: data.name,
    email: data.email,
    passwordHash: hashed,
    role: data.role,
  });

  await repo.save(user);
  return { created: true, email: data.email };
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const results: Array<{ created: boolean; email: string }> = [];

    results.push(
      await upsertUser(userRepo, {
        name: 'Manager Dev',
        email: 'manager@empleabilidad.local',
        password: 'Manager123!',
        role: UserRole.MANAGER,
      }),
    );

    results.push(
      await upsertUser(userRepo, {
        name: 'Coder Dev',
        email: 'coder@empleabilidad.local',
        password: 'Coder123!',
        role: UserRole.CODER,
      }),
    );

    for (const r of results) {
      console.log(`${r.created ? '✅ Creado' : 'ℹ️ Ya existía'}: ${r.email}`);
    }
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('Seed failed at bootstrap:', error);
  process.exit(1);
});
