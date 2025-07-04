import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EventService } from '../services/event.service';
import { CreateEventDto, GetEventsDto } from '../dto/event.dto';
import { GamificationEvent, EventType } from '../entities/gamification-event.entity';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new gamification event',
    description: 'Create a new event in the gamification system. This will trigger real-time processing.'
  })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: GamificationEvent,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createEvent(@Body() createDto: CreateEventDto): Promise<GamificationEvent> {
    return await this.eventService.createEvent(createDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get events with filtering',
    description: 'Retrieve events with optional filtering by type and user'
  })  @ApiQuery({ name: 'eventType', enum: EventType, required: false })
  @ApiQuery({ name: 'userId', type: String, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit the number of events returned' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [GamificationEvent],
  })
  async getEvents(@Query() query: GetEventsDto): Promise<GamificationEvent[]> {
    return await this.eventService.getEvents(query);
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get events for a specific user',
    description: 'Get all events for a specific user with optional type filtering'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get events for',
    example: 'user123',
  })
  @ApiQuery({ name: 'eventType', enum: EventType, required: false })
  @ApiResponse({
    status: 200,
    description: 'User events retrieved successfully',
    type: [GamificationEvent],
  })
  async getUserEvents(
    @Param('userId') userId: string,
    @Query('eventType') eventType?: EventType,
  ): Promise<GamificationEvent[]> {
    return await this.eventService.getUserEvents(userId, eventType);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get event statistics',
    description: 'Get overall statistics about events in the system'
  })
  @ApiResponse({
    status: 200,
    description: 'Event statistics retrieved successfully',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          count: { type: 'number' },
          totalPoints: { type: 'number' },
        },
      },
    },
  })
  async getEventStats() {
    return await this.eventService.getEventStats();
  }

  @Get('stats/user/:userId')
  @ApiOperation({ 
    summary: 'Get event statistics for a specific user',
    description: 'Get statistics about events for a specific user'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to get statistics for',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'User event statistics retrieved successfully',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          count: { type: 'number' },
          totalPoints: { type: 'number' },
        },
      },
    },
  })
  async getUserEventStats(@Param('userId') userId: string) {
    return await this.eventService.getEventStats(userId);
  }
}
