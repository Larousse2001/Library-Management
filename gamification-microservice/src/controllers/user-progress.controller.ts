import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserProgressService } from '../services/user-progress.service';
import { CreateUserProgressDto, UpdateUserProgressDto } from '../dto';
import { UserProgress } from '../entities/user-progress.entity';

@ApiTags('User Progress')
@Controller('progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user progress for a challenge' })
  @ApiBody({ type: CreateUserProgressDto })
  @ApiResponse({
    status: 201,
    description: 'User progress created successfully',
    type: UserProgress,
  })
  @ApiResponse({
    status: 409,
    description: 'Progress already exists for this user-challenge pair',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createUserProgressDto: CreateUserProgressDto): Promise<UserProgress> {
    return await this.userProgressService.create(createUserProgressDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all progress records for a specific user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get progress for',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user progress records',
    type: [UserProgress],
  })
  async findByUser(@Param('userId') userId: string): Promise<UserProgress[]> {
    return await this.userProgressService.findByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Increment progress count for a specific progress record' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateUserProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: UserProgress,
  })
  @ApiResponse({
    status: 404,
    description: 'Progress record not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    return await this.userProgressService.updateProgress(id, updateUserProgressDto);
  }

  @Patch(':id/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset progress count for a specific progress record' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record to reset',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress reset successfully',
    type: UserProgress,
  })
  @ApiResponse({
    status: 404,
    description: 'Progress record not found',
  })
  async resetProgress(@Param('id') id: string): Promise<UserProgress> {
    return await this.userProgressService.resetProgress(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific progress record by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record to retrieve',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress record found',
    type: UserProgress,
  })
  @ApiResponse({
    status: 404,
    description: 'Progress record not found',
  })
  async findById(@Param('id') id: string): Promise<UserProgress> {
    return await this.userProgressService.findById(id);
  }
}

