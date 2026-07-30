import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TestItemService } from './test-item.service';
import { CreateTestItemDto } from './dto/test-item.dto';

@Controller('test-items')
export class TestItemController {
  constructor(private testItemService: TestItemService) {}

  @Get()
  findAll() {
    return this.testItemService.findAll();
  }

  @Post()
  create(@Body() body: CreateTestItemDto) {
    return this.testItemService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateTestItemDto>) {
    return this.testItemService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testItemService.remove(id);
  }
}
