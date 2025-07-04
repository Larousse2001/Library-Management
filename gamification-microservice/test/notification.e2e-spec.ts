import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('NotificationController (e2e)', () => {
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

  describe('/notifications (POST)', () => {
    it('should create a notification', () => {
      return request(app.getHttpServer())
        .post('/notifications')
        .send({
          userId: 'test-user-1',
          type: 'challenge_completed',
          title: 'Test Notification',
          message: 'This is a test notification',
          data: { testKey: 'testValue' },
          priority: 'normal'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe('test-user-1');
          expect(res.body.type).toBe('challenge_completed');
          expect(res.body.title).toBe('Test Notification');
          expect(res.body.read).toBe(false);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/notifications')
        .send({
          userId: 'test-user-1',
          // missing type, title, message
        })
        .expect(400);
    });
  });

  describe('/notifications/user/:userId (GET)', () => {
    it('should return user notifications', () => {
      return request(app.getHttpServer())
        .get('/notifications/user/test-user-1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by read status', () => {
      return request(app.getHttpServer())
        .get('/notifications/user/test-user-1?read=false')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/notifications/user/:userId/unread-count (GET)', () => {
    it('should return unread count', () => {
      return request(app.getHttpServer())
        .get('/notifications/user/test-user-1/unread-count')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('unreadCount');
          expect(typeof res.body.unreadCount).toBe('number');
        });
    });
  });

  describe('/notifications/challenge-completed (POST)', () => {
    it('should create challenge completed notification', () => {
      return request(app.getHttpServer())
        .post('/notifications/challenge-completed')
        .send({
          userId: 'test-user-1',
          challengeId: 'read-5-books',
          pointsEarned: 50
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe('challenge_completed');
          expect(res.body.data.challengeId).toBe('read-5-books');
          expect(res.body.data.pointsEarned).toBe(50);
        });
    });
  });
});
