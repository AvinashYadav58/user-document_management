import { Injectable, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentRepository } from './document.repository';
import { DataSource } from 'typeorm';
import { Document } from './document.entity';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  private readonly s3: S3;
  private readonly bucketName: string;

  private readonly documentRepository: DocumentRepository;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.documentRepository = new DocumentRepository(dataSource);
    this.s3 = new S3({
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET'),
      region: configService.get<string>('AWS_REGION'),
    });
    this.bucketName =
      configService.get<string>('AWS_BUCKET_NAME') || 'cricket-arabia';
  }

  async upload(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    try {
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: `${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ACL: 'public-read',
        })
        .promise();

      return this.documentRepository.saveDocument(
        uploadResult.Location,
        createDocumentDto,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }
      throw new Error('Error uploading file: Unknown error occurred');
    }
  }

  async findAll(filterDto: GetDocumentsFilterDto): Promise<Document[]> {
    return this.documentRepository.getDocuments(filterDto);
  }

  async getDocumentById(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.getDocumentById(id);
    const updatedDocument = Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(updatedDocument);
  }

  async remove(id: string): Promise<void> {
    const result = await this.documentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }
}
