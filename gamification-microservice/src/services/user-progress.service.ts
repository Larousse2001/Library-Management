import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserProgress } from '../entities/user-progress.entity';
import { CreateUserProgressDto, UpdateUserProgressDto } from '../dto';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserProgressDto: CreateUserProgressDto): Promise<UserProgress> {
    const { userId, challengeId } = createUserProgressDto;

    // Check if progress already exists for this user-challenge pair
    const existingProgress = await this.userProgressRepository.findOne({
      where: { userId, challengeId },
    });

    if (existingProgress) {
      throw new ConflictException(
        `Progress already exists for user ${userId} and challenge ${challengeId}`,
      );
    }

    const userProgress = this.userProgressRepository.create({
      userId,
      challengeId,
      completedCount: 0,
      completed: false,
    });

    return await this.userProgressRepository.save(userProgress);
  }

  async findByUser(userId: string): Promise<UserProgress[]> {
    return await this.userProgressRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateProgress(id: string, updateUserProgressDto: UpdateUserProgressDto): Promise<UserProgress> {
    const { incrementBy = 1 } = updateUserProgressDto;

    const userProgress = await this.userProgressRepository.findOne({
      where: { id },
    });

    if (!userProgress) {
      throw new NotFoundException(`User progress with ID ${id} not found`);
    }

    const oldCount = userProgress.completedCount;
    
    // Increment the completed count
    userProgress.completedCount += incrementBy;

    // Emit progress increment event for points calculation
    this.eventEmitter.emit('progress.incremented', {
      userId: userProgress.userId,
      challengeId: userProgress.challengeId,
      incrementBy,
      newCount: userProgress.completedCount,
      oldCount,
    });

    // Emit points awarded event
    const pointsEarned = incrementBy * 10; // 10 points per increment
    this.eventEmitter.emit('points.awarded', {
      userId: userProgress.userId,
      points: pointsEarned,
      reason: `Progress increment for ${userProgress.challengeId}`,
      challengeId: userProgress.challengeId,
    });

    // Check if the challenge is completed (5 times)
    if (userProgress.completedCount >= 5 && !userProgress.completed) {
      userProgress.completed = true;
      
      // Emit challenge completion event
      const bonusPoints = 50; // Bonus points for challenge completion
      this.eventEmitter.emit('challenge.completed', {
        userId: userProgress.userId,
        challengeId: userProgress.challengeId,
        pointsEarned: bonusPoints,
        completedAt: new Date(),
      });

      // Emit bonus points event
      this.eventEmitter.emit('points.awarded', {
        userId: userProgress.userId,
        points: bonusPoints,
        reason: `Challenge completed: ${userProgress.challengeId}`,
        challengeId: userProgress.challengeId,
      });
    }

    return await this.userProgressRepository.save(userProgress);
  }

  async resetProgress(id: string): Promise<UserProgress> {
    const userProgress = await this.userProgressRepository.findOne({
      where: { id },
    });

    if (!userProgress) {
      throw new NotFoundException(`User progress with ID ${id} not found`);
    }

    // Reset the progress
    userProgress.completedCount = 0;
    userProgress.completed = false;

    return await this.userProgressRepository.save(userProgress);
  }

  async findById(id: string): Promise<UserProgress> {
    const userProgress = await this.userProgressRepository.findOne({
      where: { id },
    });

    if (!userProgress) {
      throw new NotFoundException(`User progress with ID ${id} not found`);
    }

    return userProgress;
  }
}

