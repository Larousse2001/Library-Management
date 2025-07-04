# Gamification Microservice

A comprehensive NestJS microservice for managing user progress, leaderboards, notifications, and real-time gamification features.

## 🌟 Features

### 🏆 Leaderboards & Rankings
- **Multi-Category Leaderboards**: General, Reading, Social, and Exploration categories
- **Time-based Rankings**: All-time, Monthly, and Weekly leaderboards
- **Automatic Rank Calculation**: Real-time rank updates when scores change
- **Point System**: Base points (10 per increment) + bonus points (50 per challenge completion)
- **Automated Resets**: Weekly scores reset every Monday, Monthly on the 1st

### ⚡ Real-time Notifications & Events
- **WebSocket Integration**: Real-time communication using Socket.IO
- **User-specific Rooms**: Targeted notifications for individual users
- **Live Leaderboard Updates**: Real-time score and rank changes
- **Event-Driven Architecture**: Automatic event processing and notification creation
- **Persistent Storage**: All notifications and events are stored in the database

### 📊 User Progress Tracking
- Track user progress for different challenges
- Automatic challenge completion detection
- Integration with points and leaderboard systems
- Event-driven progress updates

### 🔔 Comprehensive Notification System
- Multiple notification types (challenge completed, rank changed, achievements, summaries)
- Read/unread status tracking
- Bulk operations (mark all as read)
- Priority levels and rich data support

## 🚀 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Real-time**: Socket.IO
- **Validation**: class-validator, class-transformer
- **Scheduling**: @nestjs/schedule (for automated resets)
- **Events**: @nestjs/event-emitter
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📡 API Endpoints

### User Progress Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/progress` | Create new user progress for a challenge |
| `GET` | `/progress/user/:userId` | Get all progress records for a user |
| `GET` | `/progress/:id` | Get specific progress record by ID |
| `PATCH` | `/progress/:id` | Increment progress count (triggers events) |
| `PATCH` | `/progress/:id/reset` | Reset progress count to 0 |

### Leaderboards & Rankings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/leaderboard` | Get ranked leaderboards with filtering |
| `GET` | `/leaderboard/user/:userId/rank` | Get specific user rank |
| `POST` | `/leaderboard/user/:userId/points` | Update user points |
| `POST` | `/leaderboard/recalculate/:category` | Manually recalculate ranks |
| `GET` | `/leaderboard/top/:category` | Get top users in a category |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/notifications` | Create a new notification |
| `GET` | `/notifications/user/:userId` | Get user notifications |
| `GET` | `/notifications/user/:userId/unread-count` | Get unread count |
| `PATCH` | `/notifications/:id/read` | Mark notification as read |
| `PATCH` | `/notifications/user/:userId/read-all` | Mark all as read |
| `DELETE` | `/notifications/:id` | Delete a notification |
| `POST` | `/notifications/challenge-completed` | Create challenge completion notification |
| `POST` | `/notifications/rank-changed` | Create rank change notification |
| `POST` | `/notifications/achievement` | Create achievement notification |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/events` | Create a new gamification event |
| `GET` | `/events` | Get events with filtering |
| `GET` | `/events/user/:userId` | Get events for a specific user |
| `GET` | `/events/stats` | Get overall event statistics |
| `GET` | `/events/stats/user/:userId` | Get user-specific event statistics |

## 🔌 WebSocket Events

### Connection
- **Namespace**: `/gamification`
- **URL**: `ws://localhost:3000/gamification`

### Client Events (Send to Server)
| Event | Data | Description |
|-------|------|-------------|
| `join-user-room` | `{ userId: string }` | Join user-specific room for notifications |
| `leave-user-room` | `{ userId: string }` | Leave user-specific room |
| `join-leaderboard` | `{ category: string, period: string }` | Join leaderboard updates room |

### Server Events (Receive from Server)
| Event | Data | Description |
|-------|------|-------------|
| `notification` | `{ type: string, data: Notification }` | New notification for user |
| `rank-changed` | `{ userId, category, period, oldRank, newRank, totalPoints }` | User rank changed |
| `challenge-completed` | `{ challengeId, pointsEarned, timestamp }` | Challenge completed |
| `leaderboard-updated` | `{ type, userId, pointsAdded, newScore, period }` | Leaderboard score updated |
| `leaderboard-reset` | `{ type, timestamp, message }` | Weekly/monthly reset |

## 🗃️ Data Models

### UserProgress Entity
```typescript
{
  id: string;           // UUID primary key
  userId: string;       // User identifier
  challengeId: string;  // Challenge identifier
  completedCount: number; // Number of completions (default: 0)
  completed: boolean;   // True when completedCount >= 5
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Leaderboard Entity
```typescript
{
  id: string;                    // UUID primary key
  userId: string;                // User identifier
  category: LeaderboardCategory; // general, reading, social, exploration
  period: TimePeriod;           // all-time, monthly, weekly
  totalPoints: number;          // Total points scored
  rank: number;                 // Current rank
  challengesCompleted: number;  // Number of challenges completed
  lastScoreUpdate: Date;        // Last score update timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Entity
```typescript
{
  id: string;              // UUID primary key
  userId: string;          // Target user ID
  type: NotificationType;  // challenge_completed, rank_changed, etc.
  title: string;           // Notification title
  message: string;         // Notification content
  data: Record<string, any>; // Additional data
  read: boolean;           // Read status
  readAt: Date;            // When it was read
  priority: string;        // Priority level
  createdAt: Date;
  updatedAt: Date;
}
```

### GamificationEvent Entity
```typescript
{
  id: string;              // UUID primary key
  userId: string;          // Associated user ID
  eventType: EventType;    // progress_increment, challenge_completed, etc.
  description: string;     // Event description
  eventData: Record<string, any>; // Event-specific data
  pointsChange: number;    // Points awarded/deducted
  notificationSent: boolean; // Whether notification was sent
  createdAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Recommended)
1. **Clone and navigate to the project:**
   ```bash
   cd gamification-microservice
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

### Running Locally (Development)
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Run the application:**
   ```bash
   npm run start:dev
   ```

## 📖 API Documentation

Once the application is running, you can access:
- **Swagger Documentation**: http://localhost:3000/api/docs
- **WebSocket Demo**: Open `websocket-demo.html` in your browser

## 🎮 Usage Examples

### 1. Create User Progress and Track Completion
```bash
# Create progress
curl -X POST http://localhost:3000/progress \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "challengeId": "read-5-books"}'

# Increment progress (triggers events and points)
curl -X PATCH http://localhost:3000/progress/{progressId} \
  -H "Content-Type: application/json" \
  -d '{"incrementBy": 1}'
```

### 2. Check Leaderboard and User Rank
```bash
# Get general leaderboard
curl -X GET "http://localhost:3000/leaderboard?category=general&period=weekly&limit=10"

# Get specific user rank
curl -X GET "http://localhost:3000/leaderboard/user/user123/rank?category=general&period=weekly"
```

### 3. Manage Notifications
```bash
# Get user notifications
curl -X GET "http://localhost:3000/notifications/user/user123"

# Mark all as read
curl -X PATCH "http://localhost:3000/notifications/user/user123/read-all"

# Get unread count
curl -X GET "http://localhost:3000/notifications/user/user123/unread-count"
```

### 4. WebSocket Integration
```javascript
const socket = io('http://localhost:3000/gamification');

// Join user room for notifications
socket.emit('join-user-room', { userId: 'user123' });

// Listen for real-time notifications
socket.on('notification', (data) => {
  console.log('New notification:', data.data);
});

// Listen for rank changes
socket.on('rank-changed', (data) => {
  console.log(`Rank changed: ${data.oldRank} → ${data.newRank}`);
});
```

## 🎯 Points System

### Base Points
- **Progress Increment**: 10 points per increment
- **Challenge Completion**: 50 bonus points

### Categories
- **General**: Default category for all activities
- **Reading**: Reading-related challenges (challenge IDs containing 'read')
- **Social**: Social interaction challenges (challenge IDs containing 'social')
- **Exploration**: Exploration challenges (challenge IDs containing 'explore')

### Time Periods
- **All-time**: Permanent scores, never reset
- **Monthly**: Reset on the 1st of each month at midnight
- **Weekly**: Reset every Monday at midnight

## 🔄 Automated Processes

### Scheduled Tasks
- **Weekly Reset**: Every Monday at 00:00 UTC
- **Monthly Reset**: 1st day of each month at 00:00 UTC

### Event-Driven Processes
- **Progress Increment** → Points Award → Leaderboard Update → Rank Calculation
- **Challenge Completion** → Bonus Points → Notification Creation → Real-time Broadcast
- **Rank Change** → Notification Creation (for significant changes) → Real-time Update

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test WebSocket Features
1. Open `websocket-demo.html` in your browser
2. Connect to the WebSocket server
3. Use the demo interface to test real-time features

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `admin123` |
| `DB_DATABASE` | Database name | `gamification_db` |
| `TYPEORM_SYNCHRONIZE` | Auto-sync database schema | `true` |
| `TYPEORM_LOGGING` | Enable SQL logging | `false` |

## 🔧 Development

### Project Structure
```
src/
├── config/           # Configuration files
├── controllers/      # REST controllers
├── dto/             # Data Transfer Objects
├── entities/        # TypeORM entities
├── filters/         # Exception filters
├── gateways/        # WebSocket gateways
├── services/        # Business logic services
├── app.module.ts    # Main application module
└── main.ts          # Application bootstrap
```

### Available Scripts
- `npm run start:dev` - Development mode with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Production mode
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## 🐳 Docker Commands

### Build and run services:
```bash
docker-compose up --build
```

### Stop services:
```bash
docker-compose down
```

### Reset database:
```bash
docker-compose down -v
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f nest-app
```

## 🔒 Security Features

- Input validation using class-validator
- Global exception handling
- CORS enabled for frontend integration
- SQL injection protection via TypeORM
- Rate limiting ready (can be added via guards)

## 🚀 Production Considerations

- Set `TYPEORM_SYNCHRONIZE=false` in production
- Use connection pooling for database
- Implement proper logging (Winston, etc.)
- Add monitoring and health checks
- Use Redis for session management if needed
- Implement authentication guards
- Add rate limiting for APIs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

### 📞 Support

For questions or issues, please create a GitHub issue or contact the development team.

