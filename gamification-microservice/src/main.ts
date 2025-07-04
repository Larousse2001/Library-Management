import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  // Enable WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for frontend-backend interaction
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Gamification Microservice')
    .setDescription('API for managing user progress, leaderboards, notifications, and real-time gamification features')
    .setVersion('2.0')
    .addTag('User Progress', 'Operations related to user progress tracking')
    .addTag('Leaderboards', 'Operations related to leaderboards and rankings')
    .addTag('Notifications', 'Operations related to user notifications')
    .addTag('Events', 'Operations related to gamification events')
    .addServer(`http://localhost:${port}`, 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Listen on all interfaces for Docker compatibility
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Gamification Microservice is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🔌 WebSocket gateway available at: ws://localhost:${port}/gamification`);
}

bootstrap();

