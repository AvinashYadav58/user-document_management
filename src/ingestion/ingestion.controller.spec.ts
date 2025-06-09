import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { UserRole } from '../auth/user.entity';
import { RolesGuard } from '../auth/roles.gaurd';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockIngestionService = {
    triggerIngestion: jest.fn(),
    getIngestionStatus: jest.fn(),
    getAllIngestions: jest.fn(),
    completeIngestion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock role guard
      .compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should trigger ingestion', async () => {
    const documentId = 'doc-123';
    const ingestionId = 'ing-456';

    mockIngestionService.triggerIngestion.mockResolvedValue(ingestionId);

    const result = await controller.triggerIngestion(documentId);

    expect(service.triggerIngestion).toHaveBeenCalledWith(documentId);
    expect(result).toEqual({ ingestionId });
  });

  it('should get ingestion status', async () => {
    const ingestionId = 'ing-123';
    const mockStatus = { id: ingestionId, status: 'IN_PROGRESS' };

    mockIngestionService.getIngestionStatus.mockResolvedValue(mockStatus);

    const result = await controller.getIngestionStatus(ingestionId);

    expect(service.getIngestionStatus).toHaveBeenCalledWith(ingestionId);
    expect(result).toEqual(mockStatus);
  });

  it('should get all ingestions', async () => {
    const mockIngestions = [{ id: 'ing-1' }, { id: 'ing-2' }];

    mockIngestionService.getAllIngestions.mockResolvedValue(mockIngestions);

    const result = await controller.getAllIngestions();

    expect(service.getAllIngestions).toHaveBeenCalled();
    expect(result).toEqual(mockIngestions);
  });

  it('should complete ingestion', async () => {
    const ingestionId = 'ing-123';

    mockIngestionService.completeIngestion.mockResolvedValue(undefined);

    const result = controller.completeIngestion(ingestionId);

    expect(service.completeIngestion).toHaveBeenCalledWith(ingestionId);
    expect(result).toEqual({
      message: `Ingestion process ${ingestionId} marked as complete`,
    });
  });
});
