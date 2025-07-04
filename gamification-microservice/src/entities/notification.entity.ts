import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  CHALLENGE_COMPLETED = 'challenge_completed',
  RANK_CHANGED = 'rank_changed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  WEEKLY_SUMMARY = 'weekly_summary',
  MONTHLY_SUMMARY = 'monthly_summary',
}

@Entity('notification')
@Index(['userId', 'read'])
export class Notification {
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user who should receive the notification',
    example: 'user123',
  })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.CHALLENGE_COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Challenge Completed!',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Message content of the notification',
    example: 'Congratulations! You have completed the "Read 5 Books" challenge.',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    description: 'Additional data related to the notification',
    example: { challengeId: 'read-5-books', pointsEarned: 50 },
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  @Index()
  read: boolean;

  @ApiProperty({
    description: 'Timestamp when the notification was read',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @ApiProperty({
    description: 'Priority level of the notification',
    example: 'normal',
    default: 'normal',
  })
  @Column({ type: 'varchar', length: 50, default: 'normal' })
  priority: string;

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
