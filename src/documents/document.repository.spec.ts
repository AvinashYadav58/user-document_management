import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DocumentRepository } from './document.repository';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';

jest.mock('typeorm', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('typeorm');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    Repository: class {
      create = jest.fn();
      save = jest.fn();
      createQueryBuilder = jest.fn();
    },
  };
});

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let mockDataSource: Partial<DataSource>;

  const mockManager = {} as EntityManager;

  beforeEach(() => {
    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockManager),
    };

    repository = new DocumentRepository(mockDataSource as DataSource);
  });

  describe('saveDocument', () => {
    const mockCreateDocumentDto: CreateDocumentDto = {
      title: 'Test Doc',
      description: 'Test description',
      author: 'Test Author',
    };

    const mockDocument: Document = {
      id: '1',
      title: 'Test Doc',
      description: 'Test description',
      author: 'Test Author',
      filePath: 'test/path.pdf',
    };

    it('should create and save document successfully', async () => {
      (repository.create as jest.Mock).mockReturnValue(mockDocument);
      (repository.save as jest.Mock).mockResolvedValue(mockDocument);

      const result = await repository.saveDocument(
        'test/path.pdf',
        mockCreateDocumentDto,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateDocumentDto,
        filePath: 'test/path.pdf',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });

    it('should throw ConflictException on duplicate entry (23505)', async () => {
      (repository.create as jest.Mock).mockReturnValue(mockDocument);
      (repository.save as jest.Mock).mockRejectedValue({ code: '23505' });

      await expect(
        repository.saveDocument('test/path.pdf', mockCreateDocumentDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      (repository.create as jest.Mock).mockReturnValue(mockDocument);
      (repository.save as jest.Mock).mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(
        repository.saveDocument('test/path.pdf', mockCreateDocumentDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getDocuments', () => {
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return documents without filter', async () => {
      const mockDocs = [{ id: '1' }, { id: '2' }] as Document[];
      mockQueryBuilder.getMany.mockResolvedValue(mockDocs);

      const result = await repository.getDocuments({} as GetDocumentsFilterDto);

      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockDocs);
    });

    it('should apply search filter when provided', async () => {
      const mockDocs = [{ id: '1' }] as Document[];
      const filterDto: GetDocumentsFilterDto = { search: 'test' };

      mockQueryBuilder.getMany.mockResolvedValue(mockDocs);

      const result = await repository.getDocuments(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(document.title)'),
        { search: '%test%' },
      );
      expect(result).toEqual(mockDocs);
    });
  });
});
