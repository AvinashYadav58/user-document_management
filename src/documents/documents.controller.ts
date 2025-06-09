import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { GetDocumentsFilterDto } from './dto/get-documents-filter.dto';
import { Document } from './document.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller('documents')
@UseGuards(AuthGuard())
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.Editor, UserRole.Admin)
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.upload(file, createDocumentDto);
  }

  @Get()
  getDocuments(@Query() filterDto: GetDocumentsFilterDto): Promise<Document[]> {
    return this.documentsService.findAll(filterDto);
  }

  @Get(':id')
  getDocumentById(@Param('id') id: string): Promise<Document> {
    return this.documentsService.getDocumentById(id);
  }

  @Patch(':id')
  @Roles(UserRole.Editor, UserRole.Admin)
  updateDocuemnt(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  removeDocument(@Param('id') id: string): Promise<{ message: string }> {
    return this.documentsService.remove(id);
  }
}
