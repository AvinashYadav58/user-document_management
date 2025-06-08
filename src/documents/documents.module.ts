import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentRepository } from './document.repository';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports : [
   ConfigModule,
   TypeOrmModule.forFeature([DocumentRepository]),
   AuthModule
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentRepository]
})
export class DocumentsModule {}
