import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LeaderboardService } from '../services/leaderboard.service';
import { GetLeaderboardDto, UpdateLeaderboardDto } from '../dto/leaderboard.dto';
import { Leaderboard, LeaderboardCategory, TimePeriod } from '../entities/leaderboard.entity';

@ApiTags('Leaderboards')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get ranked leaderboards with filtering',
    description: 'Retrieve leaderboard entries with filtering by category and time period'
  })
  @ApiQuery({ name: 'category', enum: LeaderboardCategory, required: false })
  @ApiQuery({ name: 'period', enum: TimePeriod, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of entries to return (1-100)' })
  @ApiQuery({ name: 'offset', type: Number, required: false, description: 'Number of entries to skip' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard entries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        entries: {
          type: 'array',
          items: { $ref: '#/components/schemas/Leaderboard' },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            hasMore: { type: 'boolean' },
          },
        },
        category: { type: 'string' },
        period: { type: 'string' },
      },
    },
  })
  async getLeaderboard(@Query() query: GetLeaderboardDto) {
    return await this.leaderboardService.getLeaderboard(query);
  }

  @Get('user/:userId/rank')
  @ApiOperation({ 
    summary: 'Get specific user rank',
    description: 'Get the rank and statistics for a specific user in the leaderboard'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get rank for',
    example: 'user123',
  })
  @ApiQuery({ name: 'category', enum: LeaderboardCategory, required: false })
  @ApiQuery({ name: 'period', enum: TimePeriod, required: false })
  @ApiResponse({
    status: 200,
    description: 'User rank retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        category: { type: 'string' },
        period: { type: 'string' },
        rank: { type: 'number', nullable: true },
        totalPoints: { type: 'number' },
        challengesCompleted: { type: 'number' },
        message: { type: 'string', description: 'Present when user not found' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found in leaderboard',
  })
  async getUserRank(
    @Param('userId') userId: string,
    @Query('category') category?: LeaderboardCategory,
    @Query('period') period?: TimePeriod,
  ) {
    return await this.leaderboardService.getUserRank(userId, category, period);
  }

  @Post('user/:userId/points')
  @ApiOperation({ 
    summary: 'Update user points',
    description: 'Add points to a user\'s score across all time periods and recalculate ranks'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update points for',
    example: 'user123',
  })
  @ApiBody({ type: UpdateLeaderboardDto })
  @ApiResponse({
    status: 200,
    description: 'User points updated successfully',
    type: [Leaderboard],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateUserPoints(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateLeaderboardDto,
  ) {
    return await this.leaderboardService.updateUserPoints(userId, updateDto);
  }

  @Post('recalculate/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Recalculate ranks for a category',
    description: 'Manually trigger rank recalculation for a specific leaderboard category'
  })
  @ApiParam({
    name: 'category',
    enum: LeaderboardCategory,
    description: 'Category to recalculate ranks for',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranks recalculated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        category: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  async recalculateRanks(@Param('category') category: LeaderboardCategory) {
    await this.leaderboardService.recalculateRanks(category);
    return {
      message: `Ranks recalculated successfully for ${category} category`,
      category,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('top/:category')
  @ApiOperation({ 
    summary: 'Get top users in a category',
    description: 'Get the top-ranked users for a specific category and time period'
  })
  @ApiParam({
    name: 'category',
    enum: LeaderboardCategory,
    description: 'Category to get top users for',
  })
  @ApiQuery({ name: 'period', enum: TimePeriod, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of top users to return' })
  @ApiResponse({
    status: 200,
    description: 'Top users retrieved successfully',
    type: [Leaderboard],
  })
  async getTopUsers(
    @Param('category') category: LeaderboardCategory,
    @Query('period') period?: TimePeriod,
    @Query('limit') limit?: number,
  ) {
    return await this.leaderboardService.getTopUsers(
      category,
      period || TimePeriod.ALL_TIME,
      limit || 10,
    );
  }
}
