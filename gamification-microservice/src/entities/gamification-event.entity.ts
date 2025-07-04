import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  PROGRESS_INCREMENT = 'progress_increment',
  CHALLENGE_COMPLETED = 'challenge_completed',
  RANK_CHANGED = 'rank_changed',
  POINTS_AWARDED = 'points_awarded',
  WEEKLY_RESET = 'weekly_reset',
  MONTHLY_RESET = 'monthly_reset',
}

@Entity('gamification_event')
@Index(['userId', 'eventType'])
@Index(['createdAt'])
export class GamificationEvent {
  @ApiProperty({
    description: 'Unique identifier for the event',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user associated with the event',
    example: 'user123',
  })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.CHALLENGE_COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @ApiProperty({
    description: 'Description of the event',
    example: 'User completed challenge: Read 5 Books',
  })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({
    description: 'Additional event data',
    example: { challengeId: 'read-5-books', pointsAwarded: 50, previousRank: 10, newRank: 8 },
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @ApiProperty({
    description: 'Points awarded/deducted in this event',
    example: 50,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  pointsChange: number;

  @ApiProperty({
    description: 'Whether this event triggered a notification',
    example: true,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  notificationSent: boolean;

  @ApiProperty({
    description: 'Timestamp when the event occurred',
  })
  @CreateDateColumn()
  createdAt: Date;
}
