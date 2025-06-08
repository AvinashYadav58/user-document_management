import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from './document.entity';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocument = {
    id: '1',
    title: 'Test Document',
    description: 'Test Description',
    author: 'Test Author',
    filePath: 'https://example.com/test.pdf',
  } as Document;

  const mockService = {
    upload: jest.fn(),
    findAll: jest.fn(),
    getDocumentById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: mockService }],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should upload a document', async () => {
    const file = { originalname: 'test.pdf', buffer: Buffer.from('test content') } as Express.Multer.File;
    const dto = new CreateDocumentDto();
    mockService.upload.mockResolvedValue(mockDocument);

    const result = await controller.uploadDocument(file, dto);

    expect(service.upload).toHaveBeenCalledWith(file, dto);
    expect(result).toEqual(mockDocument);
  });

  it('should get all documents', async () => {
    mockService.findAll.mockResolvedValue([mockDocument]);
    const dto = new GetDocumentsFilterDto();

    const result = await controller.getDocuments(dto);

    expect(service.findAll).toHaveBeenCalledWith(dto);
    expect(result).toEqual([mockDocument]);
  });

  it('should get a document by ID', async () => {
    mockService.getDocumentById.mockResolvedValue(mockDocument);

    const result = await controller.getDocumentById('1');

    expect(service.getDocumentById).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockDocument);
  });

  it('should update a document', async () => {
    const dto = new UpdateDocumentDto();
    mockService.update.mockResolvedValue(mockDocument);

    const result = await controller.updateDocuemnt('1', dto);

    expect(service.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual(mockDocument);
  });

  it('should remove a document', async () => {
    mockService.remove.mockResolvedValue(undefined);

    const result = await controller.removeDocument('1');

    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toBeUndefined();
  });
});
