import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto, UpdateNotificationDto, GetNotificationsDto } from '../dto/notification.dto';
import { Notification, NotificationType } from '../entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private validateUUID(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new notification',
    description: 'Create a new notification for a user. This will also emit a real-time event.'
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notification,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createNotification(@Body() createDto: CreateNotificationDto): Promise<Notification> {
    return await this.notificationService.createNotification(createDto);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get user notifications',
    description: 'Get all notifications for a specific user with optional filtering'
  })  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get notifications for',
    example: 'user123',
  })
  @ApiQuery({ name: 'read', type: Boolean, required: false, description: 'Filter by read status' })
  @ApiQuery({ name: 'type', enum: NotificationType, required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit the number of notifications returned' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [Notification],
  })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query() query: GetNotificationsDto,
  ): Promise<Notification[]> {
    return await this.notificationService.getUserNotifications(userId, query);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ 
    summary: 'Get unread notifications count',
    description: 'Get the count of unread notifications for a specific user'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get unread count for',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        unreadCount: { type: 'number' },
      },
    },
  })
  async getUnreadCount(@Param('userId') userId: string) {
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    return { userId, unreadCount };
  }

  @Patch(':id/read')
  @ApiOperation({ 
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the notification to mark as read',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })  async markAsRead(@Param('id') id: string): Promise<Notification> {
    this.validateUUID(id);
    return await this.notificationService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications for a user as read'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to mark all notifications as read for',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', description: 'Number of notifications updated' },
      },
    },
  })
  async markAllAsRead(@Param('userId') userId: string) {
    return await this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a notification',
    description: 'Delete a specific notification by ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the notification to delete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })  async deleteNotification(@Param('id') id: string): Promise<void> {
    this.validateUUID(id);
    return await this.notificationService.deleteNotification(id);
  }

  // Helper endpoints for creating specific notification types

  @Post('challenge-completed')
  @ApiOperation({ 
    summary: 'Create challenge completed notification',
    description: 'Helper endpoint to create a challenge completed notification'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        challengeId: { type: 'string', example: 'read-5-books' },
        pointsEarned: { type: 'number', example: 50 },
      },
      required: ['userId', 'challengeId', 'pointsEarned'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Challenge completed notification created successfully',
    type: Notification,
  })
  async createChallengeCompletedNotification(
    @Body() body: { userId: string; challengeId: string; pointsEarned: number },
  ): Promise<Notification> {
    const { userId, challengeId, pointsEarned } = body;
    return await this.notificationService.createChallengeCompletedNotification(
      userId,
      challengeId,
      pointsEarned,
    );
  }

  @Post('rank-changed')
  @ApiOperation({ 
    summary: 'Create rank changed notification',
    description: 'Helper endpoint to create a rank changed notification'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        category: { type: 'string', example: 'general' },
        oldRank: { type: 'number', example: 10 },
        newRank: { type: 'number', example: 8 },
        period: { type: 'string', example: 'weekly' },
      },
      required: ['userId', 'category', 'oldRank', 'newRank', 'period'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rank changed notification created successfully',
    type: Notification,
  })
  async createRankChangedNotification(
    @Body() body: { userId: string; category: string; oldRank: number; newRank: number; period: string },
  ): Promise<Notification> {
    const { userId, category, oldRank, newRank, period } = body;
    return await this.notificationService.createRankChangedNotification(
      userId,
      category,
      oldRank,
      newRank,
      period,
    );
  }

  @Post('achievement')
  @ApiOperation({ 
    summary: 'Create achievement notification',
    description: 'Helper endpoint to create an achievement unlocked notification'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        achievementName: { type: 'string', example: 'Bookworm' },
        description: { type: 'string', example: 'Read 10 books in a month' },
      },
      required: ['userId', 'achievementName', 'description'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Achievement notification created successfully',
    type: Notification,
  })
  async createAchievementNotification(
    @Body() body: { userId: string; achievementName: string; description: string },
  ): Promise<Notification> {
    const { userId, achievementName, description } = body;
    return await this.notificationService.createAchievementNotification(
      userId,
      achievementName,
      description,
    );
  }
}
