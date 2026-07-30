import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TestTaskService } from './test-task.service';
import {
  CreateTestTaskDto,
  UpdateTestTaskDto,
  QueryTestTaskDto,
} from './dto/test-task.dto';

@Controller('test-tasks')
export class TestTaskController {
  constructor(private testTaskService: TestTaskService) {}

  @Get()
  findAll(@Query() query: QueryTestTaskDto) {
    return this.testTaskService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testTaskService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTestTaskDto) {
    return this.testTaskService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTestTaskDto) {
    return this.testTaskService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testTaskService.remove(id);
  }

  // 状态推进到下一阶段
  @Post(':id/advance')
  advance(@Param('id') id: string) {
    return this.testTaskService.advance(id);
  }
}
