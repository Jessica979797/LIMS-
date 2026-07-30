import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { username: string; sub: string }) {
    // 查用户角色注入 request.user.roles，供 RolesGuard 做路由级授权
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        roles: { select: { role: { select: { code: true } } } },
      },
    });
    if (!user) {
      return { id: payload.sub, username: payload.username, roles: [] };
    }
    return {
      id: user.id,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.code),
    };
  }
}
