import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/gamification',
})
export class GamificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamificationGateway.name);
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  afterInit(server: Server) {
    this.logger.log('Gamification WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from tracking
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    
    // Track user socket
    this.userSockets.set(userId, client.id);
    
    // Join user-specific room
    client.join(`user:${userId}`);
    
    this.logger.log(`User ${userId} joined their room`);
    
    return {
      event: 'joined-room',
      data: { userId, roomId: `user:${userId}` },
    };
  }

  @SubscribeMessage('leave-user-room')
  handleLeaveUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    
    // Remove from tracking
    this.userSockets.delete(userId);
    
    // Leave user-specific room
    client.leave(`user:${userId}`);
    
    this.logger.log(`User ${userId} left their room`);
    
    return {
      event: 'left-room',
      data: { userId },
    };
  }

  @SubscribeMessage('join-leaderboard')
  handleJoinLeaderboard(
    @MessageBody() data: { category: string, period: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { category, period } = data;
    const roomId = `leaderboard:${category}:${period}`;
    
    client.join(roomId);
    
    this.logger.log(`Client ${client.id} joined leaderboard room: ${roomId}`);
    
    return {
      event: 'joined-leaderboard',
      data: { roomId, category, period },
    };
  }

  // Event listeners for real-time notifications

  @OnEvent('notification.created')
  handleNotificationCreated(payload: any) {
    const { notification, userId } = payload;
    
    this.server.to(`user:${userId}`).emit('notification', {
      type: 'new-notification',
      data: notification,
    });
    
    this.logger.log(`Sent notification to user ${userId}: ${notification.title}`);
  }

  @OnEvent('rank.changed')
  handleRankChanged(payload: any) {
    const { userId, category, period, oldRank, newRank, totalPoints } = payload;
    
    // Send to user
    this.server.to(`user:${userId}`).emit('rank-changed', {
      category,
      period,
      oldRank,
      newRank,
      totalPoints,
    });
    
    // Send to leaderboard watchers
    this.server.to(`leaderboard:${category}:${period}`).emit('leaderboard-updated', {
      type: 'rank-change',
      userId,
      newRank,
      totalPoints,
    });
    
    this.logger.log(`Sent rank change notification: user ${userId} from ${oldRank} to ${newRank}`);
  }

  @OnEvent('leaderboard.updated')
  handleLeaderboardUpdated(payload: any) {
    const { userId, category, pointsAdded, entries } = payload;
    
    // Send to all relevant leaderboard rooms
    entries.forEach((entry: any) => {
      const roomId = `leaderboard:${category}:${entry.period}`;
      this.server.to(roomId).emit('leaderboard-updated', {
        type: 'score-update',
        userId,
        pointsAdded,
        newScore: entry.totalPoints,
        period: entry.period,
      });
    });
    
    this.logger.log(`Sent leaderboard update: user ${userId} gained ${pointsAdded} points`);
  }

  @OnEvent('challenge.completed')
  handleChallengeCompleted(payload: any) {
    const { userId, challengeId, pointsEarned } = payload;
    
    this.server.to(`user:${userId}`).emit('challenge-completed', {
      challengeId,
      pointsEarned,
      timestamp: new Date(),
    });
    
    this.logger.log(`Sent challenge completion notification to user ${userId}: ${challengeId}`);
  }

  @OnEvent('leaderboard.weekly.reset')
  handleWeeklyReset(payload: any) {
    // Broadcast to all connected clients
    this.server.emit('leaderboard-reset', {
      type: 'weekly',
      timestamp: payload.timestamp,
      message: payload.message,
    });
    
    this.logger.log('Broadcasted weekly leaderboard reset notification');
  }

  @OnEvent('leaderboard.monthly.reset')
  handleMonthlyReset(payload: any) {
    // Broadcast to all connected clients
    this.server.emit('leaderboard-reset', {
      type: 'monthly',
      timestamp: payload.timestamp,
      message: payload.message,
    });
    
    this.logger.log('Broadcasted monthly leaderboard reset notification');
  }

  // Utility methods

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToLeaderboard(category: string, period: string, event: string, data: any) {
    this.server.to(`leaderboard:${category}:${period}`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
