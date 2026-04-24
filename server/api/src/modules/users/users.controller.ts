import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequestUser, PublicUser } from '../auth/auth.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequestUser): Promise<PublicUser> {
    return this.usersService.getById(user.userId);
  }

  @Patch('me')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.update(user.userId, dto);
  }
}
