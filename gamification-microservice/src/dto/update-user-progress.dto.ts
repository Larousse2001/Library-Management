import { IsNumber, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProgressDto {
  @ApiProperty({
    description: 'Number to increment the completed count by',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  incrementBy?: number = 1;
}

