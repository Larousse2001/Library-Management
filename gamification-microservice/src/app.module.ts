import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';

// Entities
import { UserProgress } from './entities/user-progress.entity';
import { Leaderboard } from './entities/leaderboard.entity';
import { Notification } from './entities/notification.entity';
import { GamificationEvent } from './entities/gamification-event.entity';

// Services
import { UserProgressService } from './services/user-progress.service';
import { LeaderboardService } from './services/leaderboard.service';
import { NotificationService } from './services/notification.service';
import { EventService } from './services/event.service';

// Controllers
import { UserProgressController } from './controllers/user-progress.controller';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { NotificationController } from './controllers/notification.controller';
import { EventController } from './controllers/event.controller';

// Gateways
import { GamificationGateway } from './gateways/gamification.gateway';

// Config and Filters
import { getDatabaseConfig } from './config/database.config';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserProgress,
      Leaderboard,
      Notification,
      GamificationEvent,
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      // Set this to `true` to use wildcards
      wildcard: false,
      // The delimiter used to segment namespaces
      delimiter: '.',
      // Set this to `true` if you want to emit the newListener event
      newListener: false,
      // Set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // The maximum amount of listeners that can be assigned to an event
      maxListeners: 20,
      // Show event name in memory leak message when more than maximum amount of listeners are assigned
      verboseMemoryLeak: false,
    }),
  ],
  controllers: [
    UserProgressController,
    LeaderboardController,
    NotificationController,
    EventController,
  ],
  providers: [
    UserProgressService,
    LeaderboardService,
    NotificationService,
    EventService,
    GamificationGateway,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

