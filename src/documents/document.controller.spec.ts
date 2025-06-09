import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';
import { Document } from './document.entity';
import { NotFoundException } from '@nestjs/common';

const mockDocumentsService = {
  upload: jest.fn(),
  findAll: jest.fn(),
  getDocumentById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: typeof mockDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get(DocumentsService);
  });

  describe('uploadDocument', () => {
    it('should upload document and return it', async () => {
      const file = {
        originalname: 'file.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      const dto: CreateDocumentDto = {
        title: 'Doc1',
        description: 'desc',
        author: 'author',
      };
      const expected = {
        id: '1',
        ...dto,
        filePath: 'http://s3.com/file.txt',
      } as Document;

      service.upload.mockResolvedValue(expected);

      const result = await controller.uploadDocument(file, dto);
      expect(result).toEqual(expected);
    });

    it('should throw error if upload fails', async () => {
      const file = {
        originalname: 'file.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      const dto: CreateDocumentDto = {
        title: 'Doc1',
        description: 'desc',
        author: 'author',
      };
      service.upload.mockRejectedValue(new Error('S3 upload failed'));

      await expect(controller.uploadDocument(file, dto)).rejects.toThrow(
        'S3 upload failed',
      );
    });
  });

  describe('getDocuments', () => {
    it('should return documents list', async () => {
      const documents = [{ id: '1' }, { id: '2' }] as Document[];
      const filter: GetDocumentsFilterDto = { search: 'doc' };

      service.findAll.mockResolvedValue(documents);
      const result = await controller.getDocuments(filter);
      expect(result).toEqual(documents);
    });

    it('should return empty array if no documents found', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.getDocuments({ search: 'unknown' });
      expect(result).toEqual([]);
    });
  });

  describe('getDocumentById', () => {
    it('should return document by ID', async () => {
      const document = { id: '1', title: 'Doc' } as Document;
      service.getDocumentById.mockResolvedValue(document);
      const result = await controller.getDocumentById('1');
      expect(result).toEqual(document);
    });

    it('should throw NotFoundException if document not found', async () => {
      service.getDocumentById.mockRejectedValue(
        new NotFoundException('Not found'),
      );
      await expect(controller.getDocumentById('404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateDocument', () => {
    it('should update and return updated document', async () => {
      const updateDto: UpdateDocumentDto = { title: 'Updated' };
      const updatedDocument = { id: '1', title: 'Updated' } as Document;
      service.update.mockResolvedValue(updatedDocument);

      const result = await controller.updateDocuemnt('1', updateDto);
      expect(result).toEqual(updatedDocument);
    });

    it('should throw NotFoundException if update fails', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Document not found'),
      );
      await expect(controller.updateDocuemnt('404', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeDocument', () => {
    it('should call remove without error', async () => {
      service.remove.mockResolvedValue(undefined);
      await expect(controller.removeDocument('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if remove fails', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.removeDocument('404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
