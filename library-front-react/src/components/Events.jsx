import React, { useState, useEffect, useCallback } from 'react';
import eventService from '../services/eventService';
import config from '../config/config';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    eventType: '',
    userId: '',
    limit: 20,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    userId: '',
    eventType: 'POINTS_AWARDED',
    description: '',
    pointsChange: 0,
  });

  const eventTypes = [
    { value: '', label: 'All Types' },
    { value: 'PROGRESS_INCREMENT', label: 'Progress Increment' },
    { value: 'CHALLENGE_COMPLETED', label: 'Challenge Completed' },
    { value: 'RANK_CHANGED', label: 'Rank Changed' },
    { value: 'POINTS_AWARDED', label: 'Points Awarded' },
    { value: 'WEEKLY_RESET', label: 'Weekly Reset' },
    { value: 'MONTHLY_RESET', label: 'Monthly Reset' },
  ];
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.userId) params.userId = filters.userId;
      if (filters.limit) params.limit = filters.limit;

      const response = await eventService.getEvents(params);
      setEvents(response.data.events || response.data);
      
      if (config.LOG_LEVEL === 'debug') {
        console.log('Fetched events:', response.data);
      }
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
      
      // In development, you might want to show mock data
      if (config.ENABLE_MOCK_DATA) {
        setEvents([]); // You can add mock events here if needed
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...newEvent,
        pointsChange: parseInt(newEvent.pointsChange) || 0,
      };

      await eventService.createEvent(eventData);
      
      // Reset form
      setNewEvent({
        userId: '',
        eventType: 'POINTS_AWARDED',
        description: '',
        pointsChange: 0,
      });
      setShowCreateForm(false);
      
      // Refresh events list
      fetchEvents();
      
      alert('Event created successfully!');
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleNewEventChange = (field, value) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'PROGRESS_INCREMENT': return '📈';
      case 'CHALLENGE_COMPLETED': return '✅';
      case 'RANK_CHANGED': return '🏆';
      case 'POINTS_AWARDED': return '⭐';
      case 'WEEKLY_RESET': return '🔄';
      case 'MONTHLY_RESET': return '🗓️';
      default: return '📝';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'PROGRESS_INCREMENT': return '#3498db';
      case 'CHALLENGE_COMPLETED': return '#27ae60';
      case 'RANK_CHANGED': return '#f39c12';
      case 'POINTS_AWARDED': return '#9b59b6';
      case 'WEEKLY_RESET': return '#34495e';
      case 'MONTHLY_RESET': return '#2c3e50';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>📅 Gamification Events</h2>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-event-btn"
        >
          {showCreateForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-event-form">
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="form-row">
              <div className="form-group">
                <label>User ID:</label>
                <input
                  type="text"
                  value={newEvent.userId}
                  onChange={(e) => handleNewEventChange('userId', e.target.value)}
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Type:</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => handleNewEventChange('eventType', e.target.value)}
                >
                  {eventTypes.slice(1).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) => handleNewEventChange('description', e.target.value)}
                  placeholder="Describe the event"
                  required
                />
              </div>
              <div className="form-group">
                <label>Points Change:</label>
                <input
                  type="number"
                  value={newEvent.pointsChange}
                  onChange={(e) => handleNewEventChange('pointsChange', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Create Event</button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Event Type:</label>
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>User ID:</label>
          <input
            type="text"
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            placeholder="Filter by user ID"
          />
        </div>

        <div className="filter-group">
          <label>Limit:</label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found.</p>
          <p>Events will appear here as users interact with the gamification system!</p>
        </div>
      ) : (
        <div className="events-timeline">
          {events.map((event, index) => (
            <div key={event.id || index} className="event-card">
              <div className="event-timeline-marker">
                <div 
                  className="event-icon"
                  style={{ backgroundColor: getEventColor(event.eventType) }}
                >
                  {getEventIcon(event.eventType)}
                </div>
              </div>
              
              <div className="event-content">
                <div className="event-header">
                  <div className="event-title">
                    <span className="event-type">{event.eventType.replace(/_/g, ' ')}</span>
                    <span className="event-user">User: {event.userId}</span>
                  </div>
                  <div className="event-time">
                    {formatDate(event.createdAt)}
                  </div>
                </div>
                
                <div className="event-description">
                  {event.description}
                </div>
                
                <div className="event-details">
                  {event.pointsChange !== 0 && (
                    <div className={`points-change ${event.pointsChange > 0 ? 'positive' : 'negative'}`}>
                      {event.pointsChange > 0 ? '+' : ''}{event.pointsChange} points
                    </div>
                  )}
                  
                  {event.eventData && Object.keys(event.eventData).length > 0 && (
                    <div className="event-data">
                      <strong>Data:</strong>
                      <pre>{JSON.stringify(event.eventData, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="events-actions">
        <button 
          onClick={fetchEvents}
          className="refresh-btn"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default Events;
