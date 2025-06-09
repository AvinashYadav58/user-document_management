import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Ingestion)
    private readonly ingestionRepository: Repository<Ingestion>,
  ) {}

  async triggerIngestion(documentId: string): Promise<string> {
    const ingestion = this.ingestionRepository.create({
      documentId,
    });
    const savedIngestion = await this.ingestionRepository.save(ingestion);
    return savedIngestion.id;
  }

  async getIngestionStatus(ingestionId: string): Promise<Ingestion> {
    const ingestion = await this.ingestionRepository.findOne({
      where: { id: ingestionId },
    });

    if (!ingestion) {
      throw new NotFoundException(
        `Ingestion process with ID "${ingestionId}" not found`,
      );
    }
    return ingestion;
  }

  async getAllIngestions(): Promise<Ingestion[]> {
    return this.ingestionRepository.find();
  }

  async completeIngestion(ingestionId: string): Promise<void> {
    const ingestion = await this.ingestionRepository.findOne({
      where: { id: ingestionId },
    });

    if (!ingestion) {
      throw new NotFoundException(
        `Ingestion process with ID "${ingestionId}" not found`,
      );
    }

    ingestion.status = IngestionStatus.COMPLETED;
    ingestion.completedAt = new Date();

    await this.ingestionRepository.save(ingestion);
  }

  async failIngestion(ingestionId: string): Promise<void> {
    const ingestion = await this.ingestionRepository.findOne({
      where: { id: ingestionId },
    });

    if (!ingestion) {
      throw new NotFoundException(
        `Ingestion process with ID "${ingestionId}" not found`,
      );
    }

    ingestion.status = IngestionStatus.FAILED;
    ingestion.errorMessage = 'An error occurred during ingestion';

    await this.ingestionRepository.save(ingestion);
  }
}
