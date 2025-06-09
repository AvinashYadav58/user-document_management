import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DocumentRepository } from './document.repository';
import { Document } from './document.entity';
import { NotFoundException } from '@nestjs/common';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

jest.mock('./document.repository');

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepository: jest.Mocked<DocumentRepository>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        AWS_ACCESS_KEY_ID: 'mockAccessKeyId',
        AWS_SECRET: 'mockSecretKey',
        AWS_REGION: 'mockRegion',
        AWS_BUCKET_NAME: 'mockBucket',
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return config[key];
    }),
  };

  const mockDataSource = {} as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    documentRepository = (service as any).documentRepository;
  });

  describe('findAll', () => {
    it('should return all documents based on filter', async () => {
      const filterDto: GetDocumentsFilterDto = { search: 'invoice' };
      const mockDocuments = [{ id: '1' }, { id: '2' }] as Document[];

      documentRepository.getDocuments.mockResolvedValue(mockDocuments);

      const result = await service.findAll(filterDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentRepository.getDocuments).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getDocumentById', () => {
    it('should return the document when found', async () => {
      const mockDocument = { id: '123' } as Document;
      documentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.getDocumentById('123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.getDocumentById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the document', async () => {
      const mockDocument = {
        id: '123',
        description: 'Description test',
        author: 'Author test',
        title: 'Mock Title',
        filePath: '/mock/path',
      } as Document;
      const updateDto: UpdateDocumentDto = { title: 'Mock Title' };
      const savedDocument = { ...mockDocument, ...updateDto };

      jest.spyOn(service, 'getDocumentById').mockResolvedValue(mockDocument);
      documentRepository.save.mockResolvedValue(savedDocument);

      const result = await service.update('123', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getDocumentById).toHaveBeenCalledWith('123');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentRepository.save).toHaveBeenCalledWith(savedDocument);
      expect(result.title).toBe('Mock Title');
    });
  });

  describe('remove', () => {
    it('should delete the document and return success message', async () => {
      documentRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.remove('123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentRepository.delete).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        message: 'Document with ID 123 deleted successfully',
      });
    });

    it('should throw NotFoundException if document not found', async () => {
      documentRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove('456')).rejects.toThrow(NotFoundException);
    });
  });
});
