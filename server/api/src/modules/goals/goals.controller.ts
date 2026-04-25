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
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { ListGoalsQuery } from './dto/list-goals.query';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { GoalsService } from './goals.service';
import type { GoalView } from './goals.types';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: ListGoalsQuery,
  ): Promise<GoalView[]> {
    return this.goalsService.list(user.userId, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateGoalDto,
  ): Promise<GoalView> {
    return this.goalsService.create(user.userId, dto);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GoalView> {
    return this.goalsService.getById(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<GoalView> {
    return this.goalsService.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GoalView> {
    return this.goalsService.archive(user.userId, id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  unarchive(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GoalView> {
    return this.goalsService.unarchive(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.goalsService.remove(user.userId, id);
  }

  @Post(':id/milestones')
  addMilestone(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateMilestoneDto,
  ): Promise<GoalView> {
    return this.goalsService.addMilestone(user.userId, id, dto);
  }

  @Patch(':id/milestones/:milestoneId')
  updateMilestone(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('milestoneId', new ParseUUIDPipe()) milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ): Promise<GoalView> {
    return this.goalsService.updateMilestone(user.userId, id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  removeMilestone(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('milestoneId', new ParseUUIDPipe()) milestoneId: string,
  ): Promise<GoalView> {
    return this.goalsService.removeMilestone(user.userId, id, milestoneId);
  }
}
