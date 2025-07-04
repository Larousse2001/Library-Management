import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('UserProgressController (e2e)', () => {
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

  describe('/progress (POST)', () => {
    it('should create user progress', () => {
      return request(app.getHttpServer())
        .post('/progress')
        .send({
          userId: 'test-user-1',
          challengeId: 'read-5-books',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe('test-user-1');
          expect(res.body.challengeId).toBe('read-5-books');
          expect(res.body.completedCount).toBe(0);
          expect(res.body.completed).toBe(false);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/progress')
        .send({
          userId: 'test-user-1',
          // missing challengeId
        })
        .expect(400);
    });
  });

  describe('/progress/user/:userId (GET)', () => {
    it('should return user progress list', () => {
      return request(app.getHttpServer())
        .get('/progress/user/test-user-1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});

