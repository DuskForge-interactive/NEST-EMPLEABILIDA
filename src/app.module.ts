import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { UserEntity } from './users/user.entity';
import { VacanciesModule } from './vacancies/vacancies.module';

TypeOrmModule.forFeature([UserEntity])

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        schema: config.get<string>('DB_SCHEMA') ?? 'public',
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),

    UserModule,

    VacanciesModule,
  ],
})
export class AppModule {}
