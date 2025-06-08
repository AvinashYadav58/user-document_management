import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';

@Injectable()
export class DocumentRepository extends Repository<Document> {
  constructor(private readonly dataSource: DataSource) {
    super(Document, dataSource.createEntityManager());
  }

  async saveDocument(filePath : string, createDocumentDto: CreateDocumentDto) : Promise<Document> {
    const document = this.create({
      ...createDocumentDto,
      filePath: filePath,
    });

    try{
    await this.save(document);
    return document;
    }catch(error){
      if(error.code === '23505'){
        throw new ConflictException("Document with same name already exists");
      }else{
        throw new InternalServerErrorException();
      }
    }
  }

  async getDocuments(filterDto: GetDocumentsFilterDto) : Promise<Document[]> {

    const { search } = filterDto;
    const query = this.createQueryBuilder('document');

    if(search){
      query.andWhere('LOWER(document.title) LIKE LOWER(:search) OR LOWER(document.description) LIKE LOWER(:search) OR LOWER(document.author) LIKE LOWER(:search)',
        {search: `%${search}%`}
      )
    }
    
    const documents = await query.getMany();
    return documents;
  }
  
}
