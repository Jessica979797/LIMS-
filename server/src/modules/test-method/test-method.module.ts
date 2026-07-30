import { Module } from '@nestjs/common';
import { TestMethodService } from './test-method.service';
import { TestMethodController } from './test-method.controller';

@Module({
  providers: [TestMethodService],
  controllers: [TestMethodController],
  exports: [TestMethodService],
})
export class TestMethodModule {}
