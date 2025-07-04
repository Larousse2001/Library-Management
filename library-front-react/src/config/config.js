// Environment configuration
const config = {
  development: {
    api: {
      userService: {
        baseUrl: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8081',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
        useApi: true
      },
      searchService: {
        baseUrl: process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:8084',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
        useApi: true
      },
      booksService: {
        baseUrl: process.env.REACT_APP_BOOKS_SERVICE_URL || 'http://localhost:8085',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
        useApi: true
      },
      loanService: {
        baseUrl: process.env.REACT_APP_LOAN_SERVICE_URL || 'http://localhost:8082',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
        useApi: true
      },
      gamificationService: {
        baseUrl: process.env.REACT_APP_GAMIFICATION_SERVICE_URL || 'http://localhost:8082',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
        useApi: true,
        wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3000'
      }
    },
    features: {
      enableMockData: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true',
      enableWebSocket: process.env.REACT_APP_ENABLE_WEBSOCKET !== 'false',
      enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false'
    },
    debug: {
      logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug',
      enableApiLogging: true
    }
  },
  production: {
    api: {
      userService: {
        baseUrl: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8081',
        timeout: 30000,
        useApi: true
      },
      searchService: {
        baseUrl: process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:8084',
        timeout: 30000,
        useApi: true
      },
      booksService: {
        baseUrl: process.env.REACT_APP_BOOKS_SERVICE_URL || 'http://localhost:8085',
        timeout: 30000,
        useApi: true
      },
      loanService: {
        baseUrl: process.env.REACT_APP_LOAN_SERVICE_URL || 'http://localhost:8083',
        timeout: 30000,
        useApi: true
      },
      gamificationService: {
        baseUrl: process.env.REACT_APP_GAMIFICATION_SERVICE_URL || 'http://localhost:3000',
        timeout: 30000,
        useApi: true,
        wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3000'
      }
    },
    features: {
      enableMockData: false,
      enableWebSocket: true,
      enableNotifications: true
    },
    debug: {
      logLevel: process.env.REACT_APP_LOG_LEVEL || 'error',
      enableApiLogging: false
    }
  },
  test: {
    api: {
      userService: {
        baseUrl: 'http://localhost:8081',
        timeout: 5000,
        useApi: true
      },
      searchService: {
        baseUrl: 'http://localhost:8084',
        timeout: 5000,
        useApi: true
      },
      booksService: {
        baseUrl: 'http://localhost:8085',
        timeout: 5000,
        useApi: true
      },
      gamificationService: {
        baseUrl: 'http://localhost:3000',
        timeout: 5000,
        useApi: true,
        wsUrl: 'ws://localhost:3000'
      }
    },
    features: {
      enableMockData: false,
      enableWebSocket: false,
      enableNotifications: false
    },
    debug: {
      logLevel: 'error',
      enableApiLogging: false
    }
  }
};

const env = process.env.NODE_ENV || 'development';

// Fallback to development if the environment is not recognized
const currentConfig = config[env] || config.development;

export default currentConfig;
