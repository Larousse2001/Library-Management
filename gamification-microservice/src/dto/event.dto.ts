import { IsEnum, IsOptional, IsString, IsObject, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/gamification-event.entity';

export class CreateEventDto {
  @ApiProperty({
    description: 'ID of the user associated with the event',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.CHALLENGE_COMPLETED,
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'Description of the event',
    example: 'User completed challenge: Read 5 Books',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Additional event data',
    example: { challengeId: 'read-5-books', pointsAwarded: 50 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @ApiProperty({
    description: 'Points awarded/deducted in this event',
    example: 50,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  pointsChange?: number = 0;
}

export class GetEventsDto {
  @ApiProperty({
    description: 'Filter by event type',
    enum: EventType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiProperty({
    description: 'Filter by user ID',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
  @ApiProperty({
    description: 'Limit the number of events returned',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  limit?: number;
}
