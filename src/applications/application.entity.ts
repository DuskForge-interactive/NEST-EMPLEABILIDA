import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vacancy } from '../vacancies/vacancy.entity';
import { User } from '../users/user.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'coderId', type: 'uuid', nullable: true })
  coderId: string | null;

  @Column({ name: 'vacancyId', type: 'uuid', nullable: true })
  vacancyId: string | null;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coderId' })
  coder: User;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancyId' })
  vacancy: Vacancy;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;
}
