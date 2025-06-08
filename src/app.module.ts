import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { Document } from './documents/document.entity';
import { User } from './auth/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.gaurd';
import { JwtAuthGuard } from './auth/jwtauth.gaurd';
import { Ingestion } from './ingestion/ingestion.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'user-document-management',
    entities: [Document, User, Ingestion],
    autoLoadEntities: true,
    synchronize: true

  }), AuthModule, UsersModule, DocumentsModule, IngestionModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
