import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Vacancy } from '../vacancies/vacancy.entity';

@Entity('applications')
@Unique('UQ_coder_vacancy', ['coder', 'vacancy'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.applications, { onDelete: 'CASCADE' })
  coder: User;

  @ManyToOne(() => Vacancy, (v) => v.applications, { onDelete: 'CASCADE' })
  vacancy: Vacancy;

  @CreateDateColumn()
  createdAt: Date;
}
