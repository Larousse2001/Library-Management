import { IsEnum, IsOptional, IsString, IsObject, IsBoolean, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the user who should receive the notification',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.CHALLENGE_COMPLETED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Challenge Completed!',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Message content of the notification',
    example: 'Congratulations! You have completed the "Read 5 Books" challenge.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Additional data related to the notification',
    example: { challengeId: 'read-5-books', pointsEarned: 50 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Priority level of the notification',
    example: 'high',
    required: false,
    default: 'normal',
  })
  @IsOptional()
  @IsString()
  priority?: string = 'normal';
}

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Whether the notification has been read',
    example: true,
  })
  @IsBoolean()
  read: boolean;
}

export class GetNotificationsDto {
  @ApiProperty({
    description: 'Filter by read status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiProperty({
    description: 'Filter by notification type',
    enum: NotificationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
  @ApiProperty({
    description: 'Limit the number of notifications returned',
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
