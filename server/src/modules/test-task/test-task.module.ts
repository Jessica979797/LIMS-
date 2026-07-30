import { Module } from '@nestjs/common';
import { TestTaskService } from './test-task.service';
import { TestTaskController } from './test-task.controller';

@Module({
  providers: [TestTaskService],
  controllers: [TestTaskController],
  exports: [TestTaskService],
})
export class TestTaskModule {}
