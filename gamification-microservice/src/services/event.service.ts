import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { GamificationEvent, EventType } from '../entities/gamification-event.entity';
import { CreateEventDto, GetEventsDto } from '../dto/event.dto';
import { NotificationService } from './notification.service';
import { LeaderboardService } from './leaderboard.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(GamificationEvent)
    private readonly eventRepository: Repository<GamificationEvent>,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async createEvent(createDto: CreateEventDto): Promise<GamificationEvent> {
    const event = this.eventRepository.create(createDto);
    const savedEvent = await this.eventRepository.save(event);

    // Emit the event for real-time processing
    this.eventEmitter.emit(`event.${createDto.eventType}`, savedEvent);

    this.logger.log(`Event created: ${createDto.eventType} for user ${createDto.userId}`);

    return savedEvent;
  }
  async getEvents(query: GetEventsDto): Promise<GamificationEvent[]> {
    const whereCondition: any = {};

    if (query.eventType) {
      whereCondition.eventType = query.eventType;
    }

    if (query.userId) {
      whereCondition.userId = query.userId;
    }

    const findOptions: any = {
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: query.limit || 100, // Use provided limit or default to 100
    };

    return await this.eventRepository.find(findOptions);
  }

  async getUserEvents(userId: string, eventType?: EventType): Promise<GamificationEvent[]> {
    const whereCondition: any = { userId };

    if (eventType) {
      whereCondition.eventType = eventType;
    }

    return await this.eventRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Event listeners for automatic event creation and processing

  @OnEvent('challenge.completed')
  async handleChallengeCompleted(payload: any) {
    const { userId, challengeId, pointsEarned } = payload;

    // Create event
    await this.createEvent({
      userId,
      eventType: EventType.CHALLENGE_COMPLETED,
      description: `User completed challenge: ${challengeId}`,
      eventData: { challengeId, pointsEarned },
      pointsChange: pointsEarned,
    });

    // Create notification
    await this.notificationService.createChallengeCompletedNotification(
      userId,
      challengeId,
      pointsEarned
    );

    this.logger.log(`Processed challenge completion for user ${userId}: ${challengeId}`);
  }

  @OnEvent('rank.changed')
  async handleRankChanged(payload: any) {
    const { userId, category, period, oldRank, newRank, totalPoints } = payload;

    // Create event
    await this.createEvent({
      userId,
      eventType: EventType.RANK_CHANGED,
      description: `User rank changed in ${category} leaderboard (${period}): ${oldRank} → ${newRank}`,
      eventData: { category, period, oldRank, newRank, totalPoints },
      pointsChange: 0,
    });

    // Create notification for significant rank changes
    const rankDifference = Math.abs(oldRank - newRank);
    if (rankDifference >= 5 || newRank <= 10) {
      await this.notificationService.createRankChangedNotification(
        userId,
        category,
        oldRank,
        newRank,
        period
      );
    }

    this.logger.log(`Processed rank change for user ${userId}: ${oldRank} → ${newRank} in ${category} (${period})`);
  }

  @OnEvent('points.awarded')
  async handlePointsAwarded(payload: any) {
    const { userId, points, reason, challengeId } = payload;

    // Create event
    await this.createEvent({
      userId,
      eventType: EventType.POINTS_AWARDED,
      description: `Points awarded: ${points} (${reason})`,
      eventData: { reason, challengeId },
      pointsChange: points,
    });

    this.logger.log(`Processed points award for user ${userId}: ${points} points (${reason})`);
  }

  @OnEvent('progress.incremented')
  async handleProgressIncremented(payload: any) {
    const { userId, challengeId, incrementBy, newCount } = payload;

    // Create event
    await this.createEvent({
      userId,
      eventType: EventType.PROGRESS_INCREMENT,
      description: `Progress incremented for challenge: ${challengeId}`,
      eventData: { challengeId, incrementBy, newCount },
      pointsChange: incrementBy * 10, // 10 points per increment
    });

    this.logger.log(`Processed progress increment for user ${userId}: ${challengeId} (+${incrementBy})`);
  }

  @OnEvent('leaderboard.weekly.reset')
  async handleWeeklyReset(payload: any) {
    // Create system event
    await this.createEvent({
      userId: 'system',
      eventType: EventType.WEEKLY_RESET,
      description: 'Weekly leaderboard scores reset',
      eventData: payload,
      pointsChange: 0,
    });

    this.logger.log('Processed weekly leaderboard reset event');
  }

  @OnEvent('leaderboard.monthly.reset')
  async handleMonthlyReset(payload: any) {
    // Create system event
    await this.createEvent({
      userId: 'system',
      eventType: EventType.MONTHLY_RESET,
      description: 'Monthly leaderboard scores reset',
      eventData: payload,
      pointsChange: 0,
    });

    this.logger.log('Processed monthly leaderboard reset event');
  }

  async getEventStats(userId?: string): Promise<any> {
    const whereCondition = userId ? { userId } : {};

    const stats = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(event.pointsChange)', 'totalPoints')
      .where(whereCondition)
      .groupBy('event.eventType')
      .getRawMany();

    return stats.reduce((acc, stat) => {
      acc[stat.eventType] = {
        count: parseInt(stat.count),
        totalPoints: parseInt(stat.totalPoints) || 0,
      };
      return acc;
    }, {});
  }
}
