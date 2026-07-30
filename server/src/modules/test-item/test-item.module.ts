import { Module } from '@nestjs/common';
import { TestItemService } from './test-item.service';
import { TestItemController } from './test-item.controller';

@Module({
  providers: [TestItemService],
  controllers: [TestItemController],
  exports: [TestItemService],
})
export class TestItemModule {}
