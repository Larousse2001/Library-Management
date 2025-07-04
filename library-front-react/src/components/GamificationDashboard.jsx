import React, { useState, useEffect } from 'react';
import { 
  userProgressService, 
  leaderboardService, 
  notificationService 
} from '../services/gamificationService';
import './GamificationDashboard.css';

const GamificationDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    userProgress: [],
    topLeaderboard: [],
    recentNotifications: [],
    userRank: null,
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || 'user123';
  };

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        progressResponse,
        leaderboardResponse,
        notificationsResponse,
        rankResponse,
        unreadResponse
      ] = await Promise.allSettled([
        userProgressService.getUserProgress(userId),
        leaderboardService.getLeaderboard({ limit: 5 }),
        notificationService.getUserNotifications(userId, { limit: 5 }),
        leaderboardService.getUserRank(userId),
        notificationService.getUnreadCount(userId)
      ]);

      setDashboardData({
        userProgress: progressResponse.status === 'fulfilled' ? 
          (progressResponse.value.data || []).slice(0, 3) : [],
        topLeaderboard: leaderboardResponse.status === 'fulfilled' ? 
          (leaderboardResponse.value.data.entries || leaderboardResponse.value.data || []).slice(0, 5) : [],
        recentNotifications: notificationsResponse.status === 'fulfilled' ? 
          (notificationsResponse.value.data.notifications || notificationsResponse.value.data || []).slice(0, 3) : [],
        userRank: rankResponse.status === 'fulfilled' ? rankResponse.value.data : null,
        unreadCount: unreadResponse.status === 'fulfilled' ? 
          (unreadResponse.value.data.count || 0) : 0,
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    setSelectedUserId(userId);
    fetchDashboardData(userId);
  }, []);

  const handleUserIdChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    if (userId) {
      fetchDashboardData(userId);
    }
  };

  const getProgressPercentage = (current, target) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🎮 Gamification Dashboard</h1>
        <div className="user-selector">
          <label>User ID:</label>
          <input
            type="text"
            value={selectedUserId}
            onChange={handleUserIdChange}
            placeholder="Enter user ID"
          />
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card rank-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Your Rank</h3>
            <div className="stat-value">
              {dashboardData.userRank ? 
                getRankIcon(dashboardData.userRank.rank) : 'N/A'}
            </div>
            <div className="stat-label">
              {dashboardData.userRank ? 
                `${dashboardData.userRank.score} points` : 'No ranking data'}
            </div>
          </div>
        </div>

        <div className="stat-card notifications-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>Notifications</h3>
            <div className="stat-value">{dashboardData.unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
        </div>

        <div className="stat-card progress-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Active Challenges</h3>
            <div className="stat-value">
              {dashboardData.userProgress.filter(p => p.status === 'ACTIVE').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card completed-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-value">
              {dashboardData.userProgress.filter(p => p.status === 'COMPLETED').length}
            </div>
            <div className="stat-label">Challenges</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Progress */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📊 Recent Progress</h2>
            <a href="/progress" className="view-all-link">View All</a>
          </div>
          <div className="progress-list">
            {dashboardData.userProgress.length === 0 ? (
              <div className="empty-state">
                <p>No progress data available</p>
              </div>
            ) : (
              dashboardData.userProgress.map((progress) => (
                <div key={progress.id} className="progress-item">
                  <div className="progress-info">
                    <div className="progress-title">{progress.challengeId}</div>
                    <div className="progress-status">{progress.status}</div>
                  </div>
                  <div className="progress-visual">
                    <div className="progress-values">
                      {progress.currentValue} / {progress.targetValue}
                    </div>
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small"
                        style={{ 
                          width: `${getProgressPercentage(progress.currentValue, progress.targetValue)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Leaderboard */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🏆 Top Players</h2>
            <a href="/leaderboard" className="view-all-link">View All</a>
          </div>
          <div className="leaderboard-list">
            {dashboardData.topLeaderboard.length === 0 ? (
              <div className="empty-state">
                <p>No leaderboard data available</p>
              </div>
            ) : (
              dashboardData.topLeaderboard.map((entry, index) => (
                <div key={entry.id || index} className="leaderboard-item">
                  <div className="rank-display">
                    {getRankIcon(entry.rank || index + 1)}
                  </div>
                  <div className="player-info">
                    <div className="player-name">{entry.userId}</div>
                    <div className="player-category">{entry.category}</div>
                  </div>
                  <div className="player-score">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>🔔 Recent Notifications</h2>
            <a href="/notifications" className="view-all-link">View All</a>
          </div>
          <div className="notifications-list">
            {dashboardData.recentNotifications.length === 0 ? (
              <div className="empty-state">
                <p>No recent notifications</p>
              </div>
            ) : (
              dashboardData.recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                  </div>
                  <div className="notification-time">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          onClick={() => fetchDashboardData(selectedUserId)}
          className="refresh-btn"
        >
          🔄 Refresh Dashboard
        </button>
      </div>
    </div>
  );
};

export default GamificationDashboard;
