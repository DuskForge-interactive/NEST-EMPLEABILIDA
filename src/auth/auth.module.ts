import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import type { SignOptions } from 'jsonwebtoken';

const expiresInValue = process.env.JWT_EXPIRES_IN;
const expiresIn: SignOptions['expiresIn'] = (() => {
  if (!expiresInValue) return '1d';
  const numeric = Number(expiresInValue);
  if (Number.isNaN(numeric)) {
    return expiresInValue as SignOptions['expiresIn'];
  }
  return numeric as SignOptions['expiresIn'];
})();

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
