import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/auth.types';
import {
  AdjustCheckinDto,
  CreateCheckinDto,
  DeleteCheckinQuery,
} from './dto/checkin.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { ListHabitsQuery } from './dto/list-habits.query';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';
import type { HabitCheckinView, HabitView } from './habits.types';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: ListHabitsQuery,
  ): Promise<HabitView[]> {
    return this.habits.list(user.userId, query.archived);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateHabitDto,
  ): Promise<HabitView> {
    return this.habits.create(user.userId, dto);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<HabitView> {
    return this.habits.getById(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<HabitView> {
    return this.habits.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<HabitView> {
    return this.habits.archive(user.userId, id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  unarchive(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<HabitView> {
    return this.habits.unarchive(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.habits.remove(user.userId, id);
  }

  @Post(':id/checkin')
  @HttpCode(HttpStatus.OK)
  checkin(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateCheckinDto,
  ): Promise<HabitView> {
    return this.habits.checkin(user.userId, id, dto);
  }

  @Delete(':id/checkin')
  @HttpCode(HttpStatus.OK)
  undoCheckin(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: DeleteCheckinQuery,
  ): Promise<HabitView> {
    return this.habits.undoCheckin(user.userId, id, query.date);
  }

  @Get(':id/checkins')
  listCheckins(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<HabitCheckinView[]> {
    return this.habits.listCheckins(user.userId, id, { from, to });
  }

  @Post(':id/checkin/adjust')
  @HttpCode(HttpStatus.OK)
  adjust(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdjustCheckinDto,
  ): Promise<HabitView> {
    return this.habits.adjustHistory(user.userId, id, dto);
  }
}
