import { Test, TestingModule } from '@nestjs/testing';
import { VacanciesService } from './vacancies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vacancy } from './vacancy.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

const createDto = {
  title: 'Backend Dev',
  description: 'Build APIs',
  technologies: ['NestJS', 'TypeORM'],
  seniority: 'Mid',
  softSkills: ['Teamwork'],
  location: 'Remote',
  mode: 'Remoto',
  salaryRange: '$4k-$5k',
  company: 'Acme',
  maxApplicants: 5,
};

describe('VacanciesService', () => {
  let service: VacanciesService;
  let repo: jest.Mocked<Repository<Vacancy>>;

  beforeEach(async () => {
    const repoMock = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacanciesService,
        {
          provide: getRepositoryToken(Vacancy),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<VacanciesService>(VacanciesService);
    repo = module.get(getRepositoryToken(Vacancy));
  });

  it('should create a vacancy using normalized mode', async () => {
    const saved = { id: '1', ...createDto, mode: 'REMOTE' } as Vacancy;
    repo.create.mockReturnValue(saved);
    repo.save.mockResolvedValue(saved);

    const result = await service.create(createDto as any);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: createDto.title,
        mode: 'REMOTE',
      }),
    );
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result).toEqual(saved);
  });

  it('should throw when mode is invalid', async () => {
    await expect(
      service.create({
        ...createDto,
        mode: 'INVALID',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repo.create).not.toHaveBeenCalled();
  });
});
