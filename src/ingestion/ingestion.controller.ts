import { Controller, Post, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { Ingestion } from './ingestion.entity';

@Controller('ingestion')
@UseGuards(AuthGuard()) 
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger/:documentId')
  @Roles(UserRole.Editor, UserRole.Admin)
  async triggerIngestion(@Param('documentId') documentId: string): Promise<{ ingestionId: string }> {
    const ingestionId = await this.ingestionService.triggerIngestion(documentId);
    return { ingestionId };
  }

  @Get(':id/status')
  getIngestionStatus(@Param('id') ingestionId: string): any {
    return this.ingestionService.getIngestionStatus(ingestionId);
  }

  @Get('all')
  @Roles(UserRole.Admin)
  getAllIngestions(): Promise<Ingestion[]> {
    return this.ingestionService.getAllIngestions();
  }

  @Patch(':id/complete')
  @Roles(UserRole.Admin) 
  completeIngestion(@Param('id') ingestionId: string): Promise<void> {
    return this.ingestionService.completeIngestion(ingestionId);
  }

  @Patch(':id/fail')
  @Roles(UserRole.Admin) 
  failIngestion(@Param('id') ingestionId: string): Promise<void> {
    return this.ingestionService.failIngestion(ingestionId);
  }
}
