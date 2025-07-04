import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum LeaderboardCategory {
  GENERAL = 'general',
  READING = 'reading',
  SOCIAL = 'social',
  EXPLORATION = 'exploration',
}

export enum TimePeriod {
  ALL_TIME = 'all-time',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

@Entity('leaderboard')
@Index(['userId', 'category', 'period'], { unique: true })
export class Leaderboard {
  @ApiProperty({
    description: 'Unique identifier for the leaderboard record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user',
    example: 'user123',
  })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Leaderboard category',
    enum: LeaderboardCategory,
    example: LeaderboardCategory.GENERAL,
  })
  @Column({
    type: 'enum',
    enum: LeaderboardCategory,
    default: LeaderboardCategory.GENERAL,
  })
  @Index()
  category: LeaderboardCategory;

  @ApiProperty({
    description: 'Time period for the leaderboard',
    enum: TimePeriod,
    example: TimePeriod.ALL_TIME,
  })
  @Column({
    type: 'enum',
    enum: TimePeriod,
    default: TimePeriod.ALL_TIME,
  })
  @Index()
  period: TimePeriod;

  @ApiProperty({
    description: 'Total points scored by the user',
    example: 1250,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @ApiProperty({
    description: 'Current rank of the user in the leaderboard',
    example: 5,
  })
  @Column({ type: 'int', nullable: true })
  @Index()
  rank: number;

  @ApiProperty({
    description: 'Number of challenges completed',
    example: 15,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  challengesCompleted: number;

  @ApiProperty({
    description: 'Last time the score was updated',
    example: '2025-06-10T15:30:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  lastScoreUpdate: Date;

  @ApiProperty({
    description: 'Timestamp when the record was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
