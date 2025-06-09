import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('IngestionService', () => {
  let service: IngestionService;
  let repository: jest.Mocked<Repository<Ingestion>>;

  const mockRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Ingestion),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    repository = module.get(getRepositoryToken(Ingestion));
  });

  describe('triggerIngestion', () => {
    it('should create and save a new ingestion and return its ID', async () => {
      const ingestion = { id: 'ingestion-id' } as Ingestion;
      repository.create.mockReturnValue(ingestion);
      repository.save.mockResolvedValue(ingestion);

      const result = await service.triggerIngestion('doc-id');
      expect(result).toBe('ingestion-id');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith({ documentId: 'doc-id' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(ingestion);
    });
  });

  describe('getIngestionStatus', () => {
    it('should return the ingestion if found', async () => {
      const ingestion = { id: 'id' } as Ingestion;
      repository.findOne.mockResolvedValue(ingestion);
      const result = await service.getIngestionStatus('id');
      expect(result).toEqual(ingestion);
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.getIngestionStatus('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllIngestions', () => {
    it('should return all ingestions', async () => {
      const ingestions = [{ id: '1' }, { id: '2' }] as Ingestion[];
      repository.find.mockResolvedValue(ingestions);
      expect(await service.getAllIngestions()).toEqual(ingestions);
    });
  });

  describe('completeIngestion', () => {
    it('should update status to COMPLETED and save', async () => {
      const ingestion = { id: '1' } as Ingestion;
      repository.findOne.mockResolvedValue(ingestion);
      repository.save.mockResolvedValue({
        ...ingestion,
        status: IngestionStatus.COMPLETED,
      });

      await service.completeIngestion('1');
      expect(ingestion.status).toBe(IngestionStatus.COMPLETED);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: IngestionStatus.COMPLETED }),
      );
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.completeIngestion('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('failIngestion', () => {
    it('should update status to FAILED and save', async () => {
      const ingestion = { id: '1' } as Ingestion;
      repository.findOne.mockResolvedValue(ingestion);
      repository.save.mockResolvedValue({
        ...ingestion,
        status: IngestionStatus.FAILED,
      });

      await service.failIngestion('1');
      expect(ingestion.status).toBe(IngestionStatus.FAILED);
      expect(ingestion.errorMessage).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: IngestionStatus.FAILED }),
      );
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.failIngestion('id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
