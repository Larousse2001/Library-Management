import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Leaderboard, LeaderboardCategory, TimePeriod } from '../entities/leaderboard.entity';
import { GetLeaderboardDto, UpdateLeaderboardDto } from '../dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Event listeners for automatic points updates

  @OnEvent('points.awarded')
  async handlePointsAwarded(payload: any) {
    const { userId, points, challengeId } = payload;
    
    // Determine category based on challenge type
    let category = LeaderboardCategory.GENERAL;
    if (challengeId?.includes('read')) {
      category = LeaderboardCategory.READING;
    } else if (challengeId?.includes('social')) {
      category = LeaderboardCategory.SOCIAL;
    } else if (challengeId?.includes('explore')) {
      category = LeaderboardCategory.EXPLORATION;
    }

    // Update points in the appropriate category
    await this.updateUserPoints(userId, {
      pointsToAdd: points,
      category,
      reason: `Points awarded for ${challengeId}`,
    });

    this.logger.log(`Automatically updated ${points} points for user ${userId} in ${category} category`);
  }

  async getLeaderboard(query: GetLeaderboardDto) {
    const { category, period, limit, offset } = query;

    const leaderboard = await this.leaderboardRepository.find({
      where: {
        category,
        period,
        totalPoints: MoreThan(0),
      },
      order: {
        rank: 'ASC',
        totalPoints: 'DESC',
      },
      take: limit,
      skip: offset,
    });

    const totalEntries = await this.leaderboardRepository.count({
      where: {
        category,
        period,
        totalPoints: MoreThan(0),
      },
    });

    return {
      entries: leaderboard,
      pagination: {
        total: totalEntries,
        limit,
        offset,
        hasMore: offset + limit < totalEntries,
      },
      category,
      period,
    };
  }

  async getUserRank(userId: string, category: LeaderboardCategory = LeaderboardCategory.GENERAL, period: TimePeriod = TimePeriod.ALL_TIME) {
    const userEntry = await this.leaderboardRepository.findOne({
      where: { userId, category, period },
    });

    if (!userEntry) {
      return {
        userId,
        category,
        period,
        rank: null,
        totalPoints: 0,
        challengesCompleted: 0,
        message: 'User not found in leaderboard',
      };
    }

    return {
      userId,
      category,
      period,
      rank: userEntry.rank,
      totalPoints: userEntry.totalPoints,
      challengesCompleted: userEntry.challengesCompleted,
    };
  }

  async updateUserPoints(userId: string, updateDto: UpdateLeaderboardDto) {
    const { pointsToAdd, category = LeaderboardCategory.GENERAL, reason } = updateDto;

    // Update all time periods
    const periods = [TimePeriod.ALL_TIME, TimePeriod.MONTHLY, TimePeriod.WEEKLY];
    const updatedEntries = [];

    for (const period of periods) {
      let entry = await this.leaderboardRepository.findOne({
        where: { userId, category, period },
      });

      if (!entry) {
        entry = this.leaderboardRepository.create({
          userId,
          category,
          period,
          totalPoints: 0,
          challengesCompleted: 0,
        });
      }

      entry.totalPoints += pointsToAdd;
      entry.lastScoreUpdate = new Date();

      // Increment challenges completed if this is a challenge completion
      if (reason?.toLowerCase().includes('challenge')) {
        entry.challengesCompleted += 1;
      }

      const savedEntry = await this.leaderboardRepository.save(entry);
      updatedEntries.push(savedEntry);
    }

    // Recalculate ranks for the category
    await this.recalculateRanks(category);

    // Emit event for potential rank changes
    this.eventEmitter.emit('leaderboard.updated', {
      userId,
      category,
      pointsAdded: pointsToAdd,
      reason,
      entries: updatedEntries,
    });

    return updatedEntries;
  }

  async recalculateRanks(category: LeaderboardCategory) {
    const periods = [TimePeriod.ALL_TIME, TimePeriod.MONTHLY, TimePeriod.WEEKLY];

    for (const period of periods) {
      const entries = await this.leaderboardRepository.find({
        where: { category, period },
        order: { totalPoints: 'DESC', lastScoreUpdate: 'ASC' },
      });

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const newRank = i + 1;
        const oldRank = entry.rank;

        if (oldRank !== newRank) {
          entry.rank = newRank;
          await this.leaderboardRepository.save(entry);

          // Emit rank change event
          this.eventEmitter.emit('rank.changed', {
            userId: entry.userId,
            category,
            period,
            oldRank,
            newRank,
            totalPoints: entry.totalPoints,
          });
        }
      }
    }
  }

  // Reset weekly scores every Monday at 00:00
  @Cron(CronExpression.EVERY_WEEK)
  async resetWeeklyScores() {
    this.logger.log('Starting weekly leaderboard reset...');

    try {
      await this.leaderboardRepository.update(
        { period: TimePeriod.WEEKLY },
        {
          totalPoints: 0,
          challengesCompleted: 0,
          rank: null,
          lastScoreUpdate: new Date(),
        }
      );

      this.eventEmitter.emit('leaderboard.weekly.reset', {
        timestamp: new Date(),
        message: 'Weekly leaderboards have been reset',
      });

      this.logger.log('Weekly leaderboard reset completed successfully');
    } catch (error) {
      this.logger.error('Failed to reset weekly leaderboards:', error);
    }
  }

  // Reset monthly scores on the 1st of each month at 00:00
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyScores() {
    this.logger.log('Starting monthly leaderboard reset...');

    try {
      await this.leaderboardRepository.update(
        { period: TimePeriod.MONTHLY },
        {
          totalPoints: 0,
          challengesCompleted: 0,
          rank: null,
          lastScoreUpdate: new Date(),
        }
      );

      this.eventEmitter.emit('leaderboard.monthly.reset', {
        timestamp: new Date(),
        message: 'Monthly leaderboards have been reset',
      });

      this.logger.log('Monthly leaderboard reset completed successfully');
    } catch (error) {
      this.logger.error('Failed to reset monthly leaderboards:', error);
    }
  }

  async getTopUsers(category: LeaderboardCategory = LeaderboardCategory.GENERAL, period: TimePeriod = TimePeriod.ALL_TIME, limit: number = 10) {
    return await this.leaderboardRepository.find({
      where: {
        category,
        period,
        totalPoints: MoreThan(0),
      },
      order: {
        rank: 'ASC',
        totalPoints: 'DESC',
      },
      take: limit,
    });
  }
}
