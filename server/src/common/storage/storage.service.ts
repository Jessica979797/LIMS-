import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { Readable } from 'stream';

/**
 * 本地文件存储服务（开发期磁盘实现，接口预留后续换 MinIO/OSS）。
 * 所有相对路径都以配置的上传根目录为基准。
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root: string;

  constructor(private configService: ConfigService) {
    this.root = resolve(
      this.configService.get<string>('UPLOAD_ROOT', join(process.cwd(), 'uploads')),
    );
    if (!existsSync(this.root)) mkdirSync(this.root, { recursive: true });
    this.logger.log(`存储根目录: ${this.root}`);
  }

  // 保存文件到 subdir 子目录，返回相对 root 的路径（存库）
  async save(buffer: Buffer, subdir: string, filename: string): Promise<string> {
    const dir = join(this.root, subdir);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return `${subdir}/${filename}`;
  }

  // 读取文件流（用于下载）
  readStream(relPath: string): Readable {
    return createReadStream(this.resolvePath(relPath));
  }

  resolvePath(relPath: string): string {
    return join(this.root, relPath);
  }

  exists(relPath: string): boolean {
    return existsSync(this.resolvePath(relPath));
  }
}
