import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaderboardCategory, TimePeriod } from '../entities/leaderboard.entity';
import { Transform } from 'class-transformer';

export class GetLeaderboardDto {
  @ApiProperty({
    description: 'Category of leaderboard to retrieve',
    enum: LeaderboardCategory,
    required: false,
    default: LeaderboardCategory.GENERAL,
  })
  @IsOptional()
  @IsEnum(LeaderboardCategory)
  category?: LeaderboardCategory = LeaderboardCategory.GENERAL;

  @ApiProperty({
    description: 'Time period for the leaderboard',
    enum: TimePeriod,
    required: false,
    default: TimePeriod.ALL_TIME,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod = TimePeriod.ALL_TIME;

  @ApiProperty({
    description: 'Number of entries to return',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Number of entries to skip',
    example: 0,
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class UpdateLeaderboardDto {
  @ApiProperty({
    description: 'Points to add to the user\'s score',
    example: 50,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  pointsToAdd: number;

  @ApiProperty({
    description: 'Category to update',
    enum: LeaderboardCategory,
    required: false,
    default: LeaderboardCategory.GENERAL,
  })
  @IsOptional()
  @IsEnum(LeaderboardCategory)
  category?: LeaderboardCategory = LeaderboardCategory.GENERAL;

  @ApiProperty({
    description: 'Reason for the points update',
    example: 'Challenge completed: Read 5 Books',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
