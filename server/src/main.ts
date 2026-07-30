import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);

  // 全局 API 前缀：所有路由走 /api/*
  app.setGlobalPrefix('api');
  // 全局 DTO 校验：剥离未声明字段、自动类型转换
  // whitelist 剥离 dto 未声明字段（不写入数据库，保安全）；
  // forbidNonWhitelisted=false：未声明字段静默剥离不报错，避免前端 ProForm 的
  //   disabled/initialValues 冗余字段（如编辑时的 username）频繁触发 400
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors();

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
