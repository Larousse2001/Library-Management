import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserProgressDto {
  @ApiProperty({
    description: 'ID of the user participating in the challenge',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the challenge the user is participating in',
    example: 'challenge456',
  })
  @IsString()
  @IsNotEmpty()
  challengeId: string;
}

