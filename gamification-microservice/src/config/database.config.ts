import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserProgress } from '../entities/user-progress.entity';
import { Leaderboard } from '../entities/leaderboard.entity';
import { Notification } from '../entities/notification.entity';
import { GamificationEvent } from '../entities/gamification-event.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [UserProgress, Leaderboard, Notification, GamificationEvent],
  synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE', true),
  logging: configService.get<boolean>('TYPEORM_LOGGING', false),
  ssl: false,
});

