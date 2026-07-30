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
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
} from './dto/role.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @Roles('system_admin')
  create(@Body() body: CreateRoleDto) {
    return this.roleService.create(body);
  }

  @Patch(':id')
  @Roles('system_admin')
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.update(id, body);
  }

  @Delete(':id')
  @Roles('system_admin')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
