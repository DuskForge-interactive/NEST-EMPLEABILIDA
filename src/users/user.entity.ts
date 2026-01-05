import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  CODER = 'CODER',
  EMPLOYABILITY = 'EMPLOYABILITY',
  ADMIN = 'ADMIN',
}

@Entity({ schema: 'empleabilidad', name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'empleabilidad.user_role',
    default: UserRole.CODER,
  })
  role: UserRole;
}
