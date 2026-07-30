import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { TestItemModule } from './modules/test-item/test-item.module';
import { TestMethodModule } from './modules/test-method/test-method.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { ApplicationModule } from './modules/application/application.module';
import { SampleModule } from './modules/sample/sample.module';
import { TestTaskModule } from './modules/test-task/test-task.module';
import { TestResultModule } from './modules/test-result/test-result.module';
import { ReportTemplateModule } from './modules/report-template/report-template.module';
import { ReportModule } from './modules/report/report.module';
import { RoleModule } from './modules/role/role.module';
import { QuotationModule } from './modules/quotation/quotation.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { UserService } from './modules/user/user.service';
import { TestItemService } from './modules/test-item/test-item.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // BullMQ 队列：连接 Redis（报告生成等异步任务）
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    CustomerModule,
    TestItemModule,
    TestMethodModule,
    EquipmentModule,
    ApplicationModule,
    SampleModule,
    TestTaskModule,
    TestResultModule,
    ReportTemplateModule,
    ReportModule,
    RoleModule,
    QuotationModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局 JWT 守卫：所有接口默认需登录，@Public() 豁免
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // 全局角色守卫：@Roles 路由级授权（system_admin 通配，无标注放行）
    { provide: APP_GUARD, useClass: RolesGuard },
    // 全局审计拦截器：写操作自动记审计日志（ISO/IEC 17025 可追溯）
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private userService: UserService,
    private testItemService: TestItemService,
  ) {}

  async onModuleInit() {
    await this.userService.ensureRoles();
    await this.userService.seedAdmin();
    await this.testItemService.ensureSeed();
  }
}
