import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import type { SignOptions } from 'jsonwebtoken';
import { ConfigModule, ConfigService } from '@nestjs/config';

function parseExpiresIn(value?: string | null): SignOptions['expiresIn'] {
  if (!value) return '1d';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value as SignOptions['expiresIn'];
  }
  return numeric as SignOptions['expiresIn'];
}

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') || 'super-secret';
        return {
          secret,
          signOptions: { expiresIn: parseExpiresIn(config.get('JWT_EXPIRES_IN')) },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
