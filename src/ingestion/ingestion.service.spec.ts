import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { NotFoundException } from '@nestjs/common';

describe('IngestionService', () => {
  let service: IngestionService;
  let repo: Repository<Ingestion>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    mockRepository.create = jest.fn();
    mockRepository.save = jest.fn();
    mockRepository.findOne = jest.fn();
    mockRepository.find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Ingestion),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    repo = module.get<Repository<Ingestion>>(getRepositoryToken(Ingestion));
  });

  it('should trigger ingestion', async () => {
    const documentId = 'doc-123';
    const mockIngestion = { id: 'ing-123', documentId };

    mockRepository.create.mockReturnValue(mockIngestion);
    mockRepository.save.mockResolvedValue(mockIngestion);

    const result = await service.triggerIngestion(documentId);

    expect(repo.create).toHaveBeenCalledWith({ documentId });
    expect(repo.save).toHaveBeenCalledWith(mockIngestion);
    expect(result).toEqual('ing-123');
  });

  it('should get ingestion status', async () => {
    const ingestionId = 'ing-123';
    const mockIngestion = {
      id: ingestionId,
      status: IngestionStatus.IN_PROGRESS,
    };

    mockRepository.findOne.mockResolvedValue(mockIngestion);

    const result = await service.getIngestionStatus(ingestionId);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: ingestionId } });
    expect(result).toEqual(mockIngestion);
  });

  it('should throw NotFoundException if ingestion not found', async () => {
    const ingestionId = 'ing-123';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.getIngestionStatus(ingestionId)).rejects.toThrow(
      new NotFoundException(
        `Ingestion process with ID "${ingestionId}" not found`,
      ),
    );
  });

  it('should complete ingestion', async () => {
    const ingestionId = 'ing-123';
    const mockIngestion = {
      id: ingestionId,
      status: IngestionStatus.IN_PROGRESS,
    };

    mockRepository.findOne.mockResolvedValue(mockIngestion);
    mockRepository.save.mockResolvedValue(undefined);

    await service.completeIngestion(ingestionId);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: ingestionId } });
    expect(repo.save).toHaveBeenCalledWith({
      ...mockIngestion,
      status: IngestionStatus.COMPLETED,
      completedAt: expect.any(Date),
    });
  });

  it('should fail ingestion', async () => {
    const ingestionId = 'ing-123';
    const errorMessage = 'Some error occurred';
    const mockIngestion = {
      id: ingestionId,
      status: IngestionStatus.IN_PROGRESS,
    };

    mockRepository.findOne.mockResolvedValue(mockIngestion);
    mockRepository.save.mockResolvedValue(undefined);

    await service.failIngestion(ingestionId);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: ingestionId } });
    expect(repo.save).toHaveBeenCalledWith({
      ...mockIngestion,
      status: IngestionStatus.FAILED,
      errorMessage,
    });
  });
});
