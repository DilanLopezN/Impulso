import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { type PublicUser, toPublicUser } from '../auth/auth.types';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(user);
  }

  async update(userId: string, dto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName ?? undefined,
        avatarUrl: dto.avatarUrl ?? undefined,
        timezone: dto.timezone ?? undefined,
      },
    });
    return toPublicUser(updated);
  }
}
