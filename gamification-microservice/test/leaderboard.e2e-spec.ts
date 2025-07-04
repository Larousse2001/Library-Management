import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('LeaderboardController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/leaderboard (GET)', () => {
    it('should return leaderboard entries', () => {
      return request(app.getHttpServer())
        .get('/leaderboard')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('entries');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body).toHaveProperty('category');
          expect(res.body).toHaveProperty('period');
          expect(Array.isArray(res.body.entries)).toBe(true);
        });
    });

    it('should filter by category and period', () => {
      return request(app.getHttpServer())
        .get('/leaderboard?category=reading&period=weekly&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.category).toBe('reading');
          expect(res.body.period).toBe('weekly');
        });
    });
  });

  describe('/leaderboard/user/:userId/rank (GET)', () => {
    it('should return user rank information', () => {
      return request(app.getHttpServer())
        .get('/leaderboard/user/test-user-1/rank')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('rank');
          expect(res.body).toHaveProperty('totalPoints');
          expect(res.body).toHaveProperty('challengesCompleted');
        });
    });
  });

  describe('/leaderboard/user/:userId/points (POST)', () => {
    it('should update user points', () => {
      return request(app.getHttpServer())
        .post('/leaderboard/user/test-user-1/points')
        .send({
          pointsToAdd: 100,
          category: 'general',
          reason: 'Test points update'
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should validate points to add', () => {
      return request(app.getHttpServer())
        .post('/leaderboard/user/test-user-1/points')
        .send({
          pointsToAdd: -10, // Invalid negative points
        })
        .expect(400);
    });
  });
});
