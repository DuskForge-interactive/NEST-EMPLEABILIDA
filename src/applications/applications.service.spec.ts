import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { DataSource } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let dataSource: { createQueryRunner: jest.Mock };

  const createQueryRunnerMock = () => {
    const qb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    const manager = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      create: jest.fn(),
      save: jest.fn(),
    };

    return {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
      qb,
    };
  };

  beforeEach(async () => {
    const dsMock = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: DataSource,
          useValue: dsMock,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    dataSource = module.get(DataSource);
  });

  it('should allow applying to a vacancy and increment count', async () => {
    const queryRunner = createQueryRunnerMock();
    dataSource.createQueryRunner.mockReturnValue(queryRunner as any);

    const vacancy = { id: 'vac-1' };
    const coder = { id: 'coder-1' };
    const saved = { id: 'app-1' };

    queryRunner.manager.findOne
      .mockResolvedValueOnce(vacancy) // vacancy exists
      .mockResolvedValueOnce(coder); // coder exists

    queryRunner.qb.execute.mockResolvedValue({ affected: 1 });
    queryRunner.manager.create.mockReturnValue(saved);
    queryRunner.manager.save.mockResolvedValue(saved);

    const result = await service.applyToVacancy('vac-1', 'coder-1');

    expect(queryRunner.manager.createQueryBuilder).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenCalledWith(saved);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('should throw conflict when vacancy has no capacity', async () => {
    const queryRunner = createQueryRunnerMock();
    dataSource.createQueryRunner.mockReturnValue(queryRunner as any);

    queryRunner.manager.findOne.mockResolvedValue({ id: 'vac-1' });
    queryRunner.qb.execute.mockResolvedValue({ affected: 0 });

    await expect(service.applyToVacancy('vac-1', 'coder-1')).rejects.toBeInstanceOf(ConflictException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should throw when vacancy not found', async () => {
    const queryRunner = createQueryRunnerMock();
    dataSource.createQueryRunner.mockReturnValue(queryRunner as any);

    queryRunner.manager.findOne.mockResolvedValue(null);

    await expect(service.applyToVacancy('vac-1', 'coder-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
