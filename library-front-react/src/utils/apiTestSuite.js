// Test script to verify API connectivity and component functionality
import { userProgressService, eventService, leaderboardService } from './services/gamificationService';
import config from './config/config';

class APITestSuite {
  constructor() {
    this.results = {
      userProgress: { status: 'pending', message: '', data: null },
      events: { status: 'pending', message: '', data: null },
      leaderboard: { status: 'pending', message: '', data: null },
      websocket: { status: 'pending', message: '', data: null }
    };
  }

  async testUserProgress() {
    try {
      console.log('Testing User Progress API...');
      const response = await userProgressService.getUserProgress('user123');
      this.results.userProgress = {
        status: 'success',
        message: 'User Progress API is working',
        data: response.data
      };
    } catch (error) {
      this.results.userProgress = {
        status: 'error',
        message: `User Progress API failed: ${error.message}`,
        data: null
      };
    }
  }

  async testEvents() {
    try {
      console.log('Testing Events API...');
      const response = await eventService.getEvents({ limit: 5 });
      this.results.events = {
        status: 'success',
        message: 'Events API is working',
        data: response.data
      };
    } catch (error) {
      this.results.events = {
        status: 'error',
        message: `Events API failed: ${error.message}`,
        data: null
      };
    }
  }

  async testLeaderboard() {
    try {
      console.log('Testing Leaderboard API...');
      const response = await leaderboardService.getLeaderboard({ limit: 10 });
      this.results.leaderboard = {
        status: 'success',
        message: 'Leaderboard API is working',
        data: response.data
      };
    } catch (error) {
      this.results.leaderboard = {
        status: 'error',
        message: `Leaderboard API failed: ${error.message}`,
        data: null
      };
    }
  }

  testWebSocket() {
    return new Promise((resolve) => {
      try {
        console.log('Testing WebSocket connection...');
        const ws = new WebSocket(`${config.WS_URL}?userId=test123`);
        
        const timeout = setTimeout(() => {
          ws.close();
          this.results.websocket = {
            status: 'error',
            message: 'WebSocket connection timeout',
            data: null
          };
          resolve();
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          this.results.websocket = {
            status: 'success',
            message: 'WebSocket connection successful',
            data: { connected: true }
          };
          ws.close();
          resolve();
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          this.results.websocket = {
            status: 'error',
            message: `WebSocket connection failed: ${error.message}`,
            data: null
          };
          resolve();
        };
      } catch (error) {
        this.results.websocket = {
          status: 'error',
          message: `WebSocket test failed: ${error.message}`,
          data: null
        };
        resolve();
      }
    });
  }

  async runAllTests() {
    console.log('Starting API Test Suite...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base URL: ${config.API_BASE_URL}`);
    console.log(`WebSocket URL: ${config.WS_URL}`);
    console.log('---');

    await Promise.all([
      this.testUserProgress(),
      this.testEvents(),
      this.testLeaderboard(),
      this.testWebSocket()
    ]);

    return this.results;
  }

  printResults() {
    console.log('\n=== API Test Results ===');
    Object.entries(this.results).forEach(([test, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${test}: ${result.message}`);
      if (result.data && config.LOG_LEVEL === 'debug') {
        console.log(`   Data:`, result.data);
      }
    });
    console.log('========================\n');
  }
}

// Export for use in components or manual testing
export default APITestSuite;

// Auto-run tests if this file is executed directly (for development)
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests().then(() => {
    testSuite.printResults();
  });
}
