import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequestUser, PublicUser } from '../auth/auth.types';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import type { UserDataExport } from './users.types';

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

  @Get('me/export')
  exportData(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<UserDataExport> {
    return this.usersService.exportData(user.userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    await this.usersService.deleteAccount(user.userId, dto.password);
  }
}
