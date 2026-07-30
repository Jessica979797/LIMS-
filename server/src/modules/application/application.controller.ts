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
import { ApplicationService } from './application.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  QueryApplicationDto,
} from './dto/application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get()
  findAll(@Query() query: QueryApplicationDto) {
    return this.applicationService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateApplicationDto) {
    return this.applicationService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateApplicationDto) {
    return this.applicationService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationService.remove(id);
  }

  // 状态推进到下一阶段
  @Post(':id/advance')
  advance(@Param('id') id: string) {
    return this.applicationService.advance(id);
  }
}
