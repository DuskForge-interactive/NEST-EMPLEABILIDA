import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from '../applications/application.entity';

@Entity('vacancies')
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string[]) => (Array.isArray(value) ? value.join(',') : String(value ?? '')),
      from: (value: string) =>
        String(value ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    },
  })
  technologies: string[];

  @Column({ type: 'text' })
  seniority: string;

  @Column({
    name: 'soft_skills',
    type: 'text',
    transformer: {
      to: (value: string[]) => (Array.isArray(value) ? value.join(',') : String(value ?? '')),
      from: (value: string) =>
        String(value ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    },
  })
  softSkills: string[];

  @Column({ type: 'text' })
  location: string;

  @Column({ name: 'modality', type: 'text' })
  mode: string;

  @Column({ name: 'salary_range', type: 'text', nullable: true })
  salaryRange?: string;

  @Column({ type: 'text' })
  company: string;

  @Column({ name: 'max_applicants', type: 'int' })
  maxApplicants: number;

  @Column({ name: 'applicants_count', type: 'int', default: 0 })
  applicantsCount: number;

  @OneToMany(() => Application, (application) => application.vacancy)
  applications: Application[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
