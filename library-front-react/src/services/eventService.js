import config from '../config/config';
import { logError, logRequest, logResponse } from '../utils/errorHandler';

class EventService {
  constructor() {
    this.baseUrl = config.api.gamificationService.baseUrl;
    this.timeout = config.api.gamificationService.timeout;
  }

  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      logRequest('EventService', url, options);
      
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logResponse('EventService', url, data);
      return { data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      logError('EventService', url, error);
      throw error;
    }
  }

  // Get all events with optional filters
  async getEvents(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/events${queryString ? `?${queryString}` : ''}`;
      return await this.makeRequest(url);
    } catch (error) {
      // Fallback to mock data for development
      if (config.features.enableMockData) {
        return this.getMockEvents(params);
      }
      throw error;
    }
  }

  // Get event by ID
  async getEventById(eventId) {
    try {
      return await this.makeRequest(`/api/events/${eventId}`);
    } catch (error) {
      if (config.features.enableMockData) {
        return this.getMockEventById(eventId);
      }
      throw error;
    }
  }

  // Create new event
  async createEvent(eventData) {
    try {
      return await this.makeRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      if (config.features.enableMockData) {
        return this.createMockEvent(eventData);
      }
      throw error;
    }
  }

  // Update event
  async updateEvent(eventId, eventData) {
    try {
      return await this.makeRequest(`/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      if (config.features.enableMockData) {
        return this.updateMockEvent(eventId, eventData);
      }
      throw error;
    }
  }

  // Delete event
  async deleteEvent(eventId) {
    try {
      return await this.makeRequest(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (config.features.enableMockData) {
        return this.deleteMockEvent(eventId);
      }
      throw error;
    }
  }

  // Get user's events
  async getUserEvents(userId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/events/user/${userId}${queryString ? `?${queryString}` : ''}`;
      return await this.makeRequest(url);
    } catch (error) {
      if (config.features.enableMockData) {
        return this.getMockUserEvents(userId, params);
      }
      throw error;
    }
  }

  // Mock data methods for development/fallback
  getMockEvents(params = {}) {
    const mockEvents = [
      {
        id: 1,
        eventType: 'BOOK_READ',
        userId: 'user123',
        bookId: 'book456',
        bookTitle: 'Clean Code',
        points: 50,
        timestamp: new Date().toISOString(),
        description: 'Completed reading Clean Code',
        metadata: { pages: 464, genre: 'Programming' }
      },
      {
        id: 2,
        eventType: 'REVIEW_WRITTEN',
        userId: 'user123',
        bookId: 'book789',
        bookTitle: 'JavaScript: The Good Parts',
        points: 25,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'Wrote a review for JavaScript: The Good Parts',
        metadata: { rating: 5, reviewLength: 150 }
      },
      {
        id: 3,
        eventType: 'GOAL_ACHIEVED',
        userId: 'user123',
        points: 100,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Achieved monthly reading goal',
        metadata: { goalType: 'monthly_books', target: 5, achieved: 5 }
      },
      {
        id: 4,
        eventType: 'STREAK_MILESTONE',
        userId: 'user456',
        points: 75,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        description: 'Reached 7-day reading streak',
        metadata: { streakDays: 7, streakType: 'daily_reading' }
      },
      {
        id: 5,
        eventType: 'CHALLENGE_COMPLETED',
        userId: 'user789',
        points: 200,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        description: 'Completed Summer Reading Challenge',
        metadata: { challengeName: 'Summer Reading Challenge', participants: 150 }
      }
    ];

    // Apply filters
    let filteredEvents = mockEvents;
    
    if (params.eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === params.eventType);
    }
    
    if (params.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === params.userId);
    }
    
    if (params.limit) {
      filteredEvents = filteredEvents.slice(0, parseInt(params.limit));
    }

    return {
      data: {
        events: filteredEvents,
        total: filteredEvents.length,
        page: 1,
        limit: params.limit || 10
      },
      status: 200
    };
  }

  getMockEventById(eventId) {
    const mockEvents = this.getMockEvents().data.events;
    const event = mockEvents.find(e => e.id === parseInt(eventId));
    
    if (!event) {
      throw new Error('Event not found');
    }

    return {
      data: event,
      status: 200
    };
  }

  createMockEvent(eventData) {
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...eventData
    };

    return {
      data: newEvent,
      status: 201
    };
  }

  updateMockEvent(eventId, eventData) {
    return {
      data: {
        id: parseInt(eventId),
        timestamp: new Date().toISOString(),
        ...eventData
      },
      status: 200
    };
  }

  deleteMockEvent(eventId) {
    return {
      data: { message: 'Event deleted successfully' },
      status: 200
    };
  }

  getMockUserEvents(userId, params = {}) {
    const allEvents = this.getMockEvents().data.events;
    const userEvents = allEvents.filter(event => event.userId === userId);
    
    return {
      data: {
        events: userEvents,
        total: userEvents.length,
        page: 1,
        limit: params.limit || 10
      },
      status: 200
    };
  }
}

const eventService = new EventService();
export default eventService;
