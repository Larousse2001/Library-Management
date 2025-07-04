import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_progress')
export class UserProgress {
  @ApiProperty({
    description: 'Unique identifier for the user progress record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user participating in the challenge',
    example: 'user123',
  })
  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @ApiProperty({
    description: 'ID of the challenge the user is participating in',
    example: 'challenge456',
  })
  @Column({ type: 'varchar', length: 255 })
  challengeId: string;

  @ApiProperty({
    description: 'Number of times the user has completed this challenge',
    example: 3,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @ApiProperty({
    description: 'Whether the user has fully completed this challenge (5 times)',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  completed: boolean;

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

