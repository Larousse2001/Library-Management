import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, GetNotificationsDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    const savedNotification = await this.notificationRepository.save(notification);

    // Emit real-time notification event
    this.eventEmitter.emit('notification.created', {
      notification: savedNotification,
      userId: savedNotification.userId,
    });

    this.logger.log(`Notification created for user ${savedNotification.userId}: ${savedNotification.title}`);

    return savedNotification;
  }
  async getUserNotifications(userId: string, query?: GetNotificationsDto): Promise<Notification[]> {
    const whereCondition: any = { userId };

    if (query?.read !== undefined) {
      whereCondition.read = query.read;
    }

    if (query?.type) {
      whereCondition.type = query.type;
    }

    const findOptions: any = {
      where: whereCondition,
      order: { createdAt: 'DESC' },
    };

    if (query?.limit) {
      findOptions.take = query.limit;
    }

    return await this.notificationRepository.find(findOptions);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    notification.read = true;
    notification.readAt = new Date();

    const updatedNotification = await this.notificationRepository.save(notification);

    // Emit read event
    this.eventEmitter.emit('notification.read', {
      notification: updatedNotification,
      userId: updatedNotification.userId,
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    // Emit bulk read event
    this.eventEmitter.emit('notifications.bulk.read', {
      userId,
      updatedCount: result.affected || 0,
    });

    this.logger.log(`Marked ${result.affected || 0} notifications as read for user ${userId}`);

    return { updated: result.affected || 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    await this.notificationRepository.remove(notification);

    this.logger.log(`Notification ${notificationId} deleted`);
  }

  // Helper methods for creating specific notification types
  async createChallengeCompletedNotification(userId: string, challengeId: string, pointsEarned: number): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.CHALLENGE_COMPLETED,
      title: 'Challenge Completed! 🎉',
      message: `Congratulations! You've completed the challenge and earned ${pointsEarned} points.`,
      data: {
        challengeId,
        pointsEarned,
      },
      priority: 'high',
    });
  }

  async createRankChangedNotification(userId: string, category: string, oldRank: number, newRank: number, period: string): Promise<Notification> {
    const isImprovement = newRank < oldRank;
    const emoji = isImprovement ? '🚀' : '📉';
    const action = isImprovement ? 'climbed to' : 'moved to';

    return this.createNotification({
      userId,
      type: NotificationType.RANK_CHANGED,
      title: `Rank Update ${emoji}`,
      message: `You've ${action} rank #${newRank} in the ${category} leaderboard (${period}).`,
      data: {
        category,
        oldRank,
        newRank,
        period,
        isImprovement,
      },
      priority: isImprovement ? 'high' : 'normal',
    });
  }

  async createAchievementNotification(userId: string, achievementName: string, description: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement Unlocked! 🏆',
      message: `You've unlocked the "${achievementName}" achievement! ${description}`,
      data: {
        achievementName,
        description,
      },
      priority: 'high',
    });
  }

  async createWeeklySummaryNotification(userId: string, weeklyData: any): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.WEEKLY_SUMMARY,
      title: 'Weekly Summary 📊',
      message: `Here's your weekly progress summary. You've earned ${weeklyData.pointsEarned} points this week!`,
      data: weeklyData,
      priority: 'normal',
    });
  }

  async createMonthlySummaryNotification(userId: string, monthlyData: any): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.MONTHLY_SUMMARY,
      title: 'Monthly Summary 📈',
      message: `Your monthly achievements are impressive! You've earned ${monthlyData.pointsEarned} points this month.`,
      data: monthlyData,
      priority: 'normal',
    });
  }
}
