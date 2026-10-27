import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AcademicModule } from './academic/academic.module';
import { LmsModule } from './lms/lms.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [AcademicModule, LmsModule, SyncModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
