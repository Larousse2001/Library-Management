import React, { useState, useEffect } from 'react';
import { notificationService, createWebSocketConnection } from '../services/gamificationService';
import { getCurrentUserId } from '../utils/authUtils';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    isRead: '',
    type: '',
    limit: 20,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [webSocket, setWebSocket] = useState(null);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'ACHIEVEMENT',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You have unlocked the "Speed Reader" achievement.',
      isRead: false,
      createdAt: '2024-01-16T10:30:00Z',
      metadata: {
        achievementId: 'speed-reader',
        points: 150
      }
    },
    {
      id: 2,
      type: 'CHALLENGE_COMPLETE',
      title: 'Challenge Completed!',
      message: 'You have successfully completed the "Reading Marathon" challenge.',
      isRead: false,
      createdAt: '2024-01-16T09:15:00Z',
      metadata: {
        challengeId: 'reading-marathon',
        reward: '500 XP + Badge'
      }
    },
    {
      id: 3,
      type: 'RANK_CHANGE',
      title: 'Rank Update',
      message: 'Your rank has improved! You are now #23 on the leaderboard.',
      isRead: true,
      createdAt: '2024-01-15T14:20:00Z',
      metadata: {
        oldRank: 25,
        newRank: 23
      }
    },
    {
      id: 4,
      type: 'SYSTEM',
      title: 'Weekly Summary',
      message: 'Here is your weekly progress report. You earned 320 XP this week!',
      isRead: true,
      createdAt: '2024-01-15T08:00:00Z',
      metadata: {
        weeklyXP: 320,
        booksRead: 2
      }
    }
  ];

  const notificationTypes = [
    { value: '', label: 'All Types' },
    { value: 'ACHIEVEMENT', label: 'Achievement' },
    { value: 'CHALLENGE_COMPLETE', label: 'Challenge Complete' },
    { value: 'RANK_CHANGE', label: 'Rank Change' },
    { value: 'SYSTEM', label: 'System' },
  ];

  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || 'user123';
  };
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getCurrentUserId();
      const params = {};
      if (filters.isRead !== '') params.isRead = filters.isRead === 'true';
      if (filters.type) params.type = filters.type;
      if (filters.limit) params.limit = filters.limit;

      try {
        const response = await notificationService.getUserNotifications(userId, params);
        setNotifications(response.data.notifications || response.data);
      } catch (apiError) {
        console.log('API not available, using mock notifications data');
        // Filter mock data based on filters
        let filteredNotifications = mockNotifications;
        if (filters.isRead !== '') {
          const isReadFilter = filters.isRead === 'true';
          filteredNotifications = filteredNotifications.filter(n => n.isRead === isReadFilter);
        }
        if (filters.type) {
          filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
        }
        setNotifications(filteredNotifications);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const userId = getCurrentUserId();
      try {
        const response = await notificationService.getUnreadCount(userId);
        setUnreadCount(response.data.count || 0);
      } catch (apiError) {
        console.log('API not available, calculating unread count from mock data');
        const unreadMockCount = mockNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadMockCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    }
  };

  const setupWebSocket = () => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No user ID available for WebSocket connection');
      return;
    }
    
    const ws = createWebSocketConnection(userId);
    if (!ws) {
      console.warn('Failed to create WebSocket connection');
      return;
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        // Add new notification to the list
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      } else if (data.type === 'notification_read') {
        // Update notification read status
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === data.notificationId 
              ? { ...notif, isRead: true } 
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error in Notifications:', error);
    };
    
    setWebSocket(ws);
    
    return () => {
      ws.close();
    };
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    const cleanup = setupWebSocket();
    
    return cleanup;
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = getCurrentUserId();
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ACHIEVEMENT': return '🏆';
      case 'CHALLENGE_COMPLETE': return '✅';
      case 'RANK_CHANGE': return '📈';
      case 'SYSTEM': return '⚙️';
      default: return '📢';
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-title">
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        <div className="header-actions">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.isRead}
            onChange={(e) => handleFilterChange('isRead', e.target.value)}
          >
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
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
          </select>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications found.</p>
          <p>You'll see notifications here when there are updates!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                  <span className={`notification-type ${notification.type.toLowerCase()}`}>
                    {notification.type}
                  </span>
                </div>
              </div>
              
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="mark-read-btn"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="delete-btn"
                  title="Delete notification"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
