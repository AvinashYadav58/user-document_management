import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { Ingestion, IngestionStatus } from './ingestion.entity';

jest.mock('./ingestion.service');

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: jest.Mocked<IngestionService>;

  const mockService = {
    triggerIngestion: jest.fn(),
    getIngestionStatus: jest.fn(),
    getAllIngestions: jest.fn(),
    completeIngestion: jest.fn(),
    failIngestion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get(IngestionService);
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion and return ingestion ID', async () => {
      service.triggerIngestion.mockResolvedValue('test-id');

      const result = await controller.triggerIngestion('doc-id');
      expect(result).toEqual({ ingestionId: 'test-id' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.triggerIngestion).toHaveBeenCalledWith('doc-id');
    });

    it('should handle errors when triggering ingestion fails', async () => {
      service.triggerIngestion.mockRejectedValue(
        new Error('Triggering ingestion failed'),
      );

      await expect(controller.triggerIngestion('invalid-doc')).rejects.toThrow(
        'Triggering ingestion failed',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.triggerIngestion).toHaveBeenCalledWith('invalid-doc');
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status', async () => {
      const mockIngestion = {
        id: '1',
        documentId: 'doc-1',
        status: IngestionStatus.IN_PROGRESS,
      } as Ingestion;

      service.getIngestionStatus.mockResolvedValue(mockIngestion);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await controller.getIngestionStatus('1');
      expect(result).toEqual(mockIngestion);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getIngestionStatus).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException for non-existing ingestion', async () => {
      service.getIngestionStatus.mockRejectedValue(
        new NotFoundException('Ingestion process not found'),
      );

      await expect(controller.getIngestionStatus('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getIngestionStatus).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('getAllIngestions', () => {
    it('should return all ingestions', async () => {
      const mockIngestions = [
        { id: '1', documentId: 'doc-1' },
        { id: '2', documentId: 'doc-2' },
      ] as Ingestion[];

      service.getAllIngestions.mockResolvedValue(mockIngestions);

      const result = await controller.getAllIngestions();
      expect(result).toEqual(mockIngestions);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getAllIngestions).toHaveBeenCalled();
    });

    it('should handle errors when fetching ingestions fails', async () => {
      service.getAllIngestions.mockRejectedValue(
        new Error('Failed to retrieve ingestions'),
      );

      await expect(controller.getAllIngestions()).rejects.toThrow(
        'Failed to retrieve ingestions',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getAllIngestions).toHaveBeenCalled();
    });
  });

  describe('completeIngestion', () => {
    it('should complete ingestion successfully', async () => {
      service.completeIngestion.mockResolvedValue({
        message: 'Ingestion completed',
      });

      await controller.completeIngestion('ingestion-id');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.completeIngestion).toHaveBeenCalledWith('ingestion-id');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      service.completeIngestion.mockRejectedValue(
        new NotFoundException('Ingestion process not found'),
      );

      await expect(controller.completeIngestion('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.completeIngestion).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('failIngestion', () => {
    it('should mark ingestion as failed successfully', async () => {
      service.failIngestion.mockResolvedValue({ message: 'Ingestion failed' });

      await controller.failIngestion('ingestion-id');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.failIngestion).toHaveBeenCalledWith('ingestion-id');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      service.failIngestion.mockRejectedValue(
        new NotFoundException('Ingestion process not found'),
      );

      await expect(controller.failIngestion('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.failIngestion).toHaveBeenCalledWith('invalid-id');
    });
  });
});
