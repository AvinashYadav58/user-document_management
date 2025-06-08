import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { DocumentRepository } from './document.repository';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Mock aws-sdk S3 class
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    })),
  };
});

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepository: Partial<Record<keyof DocumentRepository, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;
  let s3UploadMock: jest.Mock;

  beforeEach(async () => {
    documentRepository = {
      create: jest.fn().mockImplementation((data) => data), // Mock `create`
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockImplementation(() => ({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
      saveDocument: jest.fn(),
      getDocuments: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        const config = {
          AWS_ACCESS_KEY_ID: 'fakeAccessKey',
          AWS_SECRET: 'fakeSecret',
          AWS_REGION: 'fakeRegion',
          AWS_BUCKET_NAME: 'fakeBucket',
        };
        return config[key];
      }),
    };

    const dataSourceMock = {
      createEntityManager: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: DocumentRepository,
          useValue: documentRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);

    const s3Instance = (service as any).s3;
    s3UploadMock = jest.fn();
    s3Instance.upload = jest.fn(() => ({
      promise: s3UploadMock,
      abort: jest.fn(),
      send: jest.fn(),
      on: jest.fn(),
    }));
  });

  describe('upload', () => {
    it.skip('uploads file to S3 and saves document', async () => {
      const file = {
        originalname: 'test.txt',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      const createDto = { title: 'Test doc' };

      const s3Response = {
        Location: 'https://s3.fakeBucket/test.txt',
      };

      s3UploadMock.mockResolvedValueOnce(s3Response);
      (documentRepository.save as jest.Mock).mockResolvedValueOnce({
        id: '123',
        filePath: s3Response.Location,
        title: createDto.title,
      });

      const result = await service.upload(file, createDto as any);

      expect((service as any).bucketName).toBe('fakeBucket');
      expect((service as any).s3.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'fakeBucket',
          Key: expect.stringContaining(file.originalname),
          Body: file.buffer,
          ACL: 'public-read',
        }),
      );
      expect(documentRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        filePath: s3Response.Location,
        ...createDto,
      }));
      expect(result).toEqual({
        id: '123',
        filePath: s3Response.Location,
        title: createDto.title,
      });
    });

    it('throws error when S3 upload fails', async () => {
      const file = {
        originalname: 'fail.txt',
        buffer: Buffer.from('fail'),
      } as Express.Multer.File;

      const createDto = { title: 'Fail doc' };

      s3UploadMock.mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(service.upload(file, createDto as any)).rejects.toThrow('Error uploading file: S3 upload failed');
    });
  });

  describe('findAll', () => {
    it.skip('returns list of documents', async () => {
      const documents = [{ id: '1' }, { id: '2' }] as any[];
      (documentRepository.getDocuments as jest.Mock).mockResolvedValueOnce(documents);

      const result = await service.findAll({});

      expect(documentRepository.getDocuments).toHaveBeenCalled();
      expect(result).toEqual(documents);
    });
  });
});
