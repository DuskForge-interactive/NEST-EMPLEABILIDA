import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Vacancy } from '../vacancies/vacancy.entity';
import { Application } from '../applications/application.entity';

export function typeOrmConfig(): TypeOrmModuleOptions {
  const base: Partial<TypeOrmModuleOptions> = {
    type: 'postgres',
    entities: [User, Vacancy, Application],
    synchronize: process.env.DB_SYNCHRONIZE
      ? process.env.DB_SYNCHRONIZE === 'true'
      : true,
  };

  if (process.env.DATABASE_URL) {
    return {
      ...base,
      url: process.env.DATABASE_URL,
      schema: process.env.DB_SCHEMA ?? 'public',
      ssl:
        process.env.DB_SSL === 'false'
          ? false
          : {
              rejectUnauthorized: false,
            },
    } as TypeOrmModuleOptions;
  }

  return {
    ...base,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  } as TypeOrmModuleOptions;
}
 
