import { IsOptional, IsString } from 'class-validator';

export class GetDocumentsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;
}
