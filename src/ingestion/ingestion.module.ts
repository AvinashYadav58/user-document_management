import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { Ingestion } from './ingestion.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ingestion]),  AuthModule],
  controllers: [IngestionController],
  providers: [IngestionService]
})
export class IngestionModule {}
