import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/gamificationService';
import bookService from '../services/bookService';
import config from '../config/config';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    period: '',
    limit: 20,
  });
  const [userRank, setUserRank] = useState(null);

  // Load leaderboard data from API
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.period) params.period = filters.period;
      if (filters.limit) params.limit = filters.limit;

      const [leaderboardResponse, userRankResponse] = await Promise.allSettled([
        leaderboardService.getLeaderboard(params),
        leaderboardService.getUserRank(bookService.getCurrentUserId(), params)
      ]);

      if (leaderboardResponse.status === 'fulfilled') {
        const data = leaderboardResponse.value.data;
        setLeaderboardData(data.entries || data || []);
      } else {
        console.warn('Failed to fetch leaderboard, using mock data');
        setLeaderboardData(mockLeaderboardData);
      }

      if (userRankResponse.status === 'fulfilled') {
        setUserRank(userRankResponse.value.data);
      } else {
        console.warn('Failed to fetch user rank, using mock data');
        setUserRank(mockUserRank);
      }
      
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Leaderboard error:', err);
      // Fallback to mock data
      setLeaderboardData(mockLeaderboardData);
      setUserRank(mockUserRank);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Mock data for demonstration
  const mockLeaderboardData = [
    {
      id: 1,
      userId: 'user1',
      username: 'Alice Johnson',
      score: 2850,
      rank: 1,
      category: 'OVERALL',
      lastUpdated: '2024-01-16T10:30:00Z',
      avatar: 'AJ',
      level: 15,
      achievements: 12
    },
    {
      id: 2,
      userId: 'user2', 
      username: 'Bob Smith',
      score: 2640,
      rank: 2,
      category: 'OVERALL',
      lastUpdated: '2024-01-16T09:15:00Z',
      avatar: 'BS',
      level: 14,
      achievements: 10
    },
    {
      id: 3,
      userId: 'user3',
      username: 'Charlie Brown',
      score: 2380,
      rank: 3,
      category: 'OVERALL', 
      lastUpdated: '2024-01-16T08:45:00Z',
      avatar: 'CB',
      level: 13,
      achievements: 9
    },
    {
      id: 4,
      userId: 'user4',
      username: 'Diana Prince',
      score: 2150,
      rank: 4,
      category: 'OVERALL',
      lastUpdated: '2024-01-16T11:20:00Z',
      avatar: 'DP',
      level: 12,
      achievements: 8
    },
    {
      id: 5,
      userId: 'user5',
      username: 'Eve Wilson',
      score: 1980,
      rank: 5,
      category: 'OVERALL',
      lastUpdated: '2024-01-16T07:30:00Z',
      avatar: 'EW',
      level: 11,
      achievements: 7
    }
  ];

  const mockUserRank = {
    userId: 'user123',
    username: 'Current User',
    rank: 23,
    score: 1450,
    category: 'OVERALL'
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'READING', label: 'Reading' },
    { value: 'CHALLENGES', label: 'Challenges' },
    { value: 'OVERALL', label: 'Overall' },
  ];

  const periods = [
    { value: '', label: 'All Time' },
    { value: 'WEEKLY', label: 'This Week' },
    { value: 'MONTHLY', label: 'This Month' },
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.period) params.period = filters.period;
      if (filters.limit) params.limit = filters.limit;

      try {
        const response = await leaderboardService.getLeaderboard(params);
        setLeaderboardData(response.data.entries || response.data);
      } catch (apiError) {
        console.log('API not available, using mock leaderboard data');
        setLeaderboardData(mockLeaderboardData);
      }
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Error fetching leaderboard:', err);
      setLeaderboardData(mockLeaderboardData);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'user123';
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.period) params.period = filters.period;

      try {
        const response = await leaderboardService.getUserRank(userId, params);
        setUserRank(response.data);
      } catch (apiError) {
        console.log('API not available, using mock user rank data');
        setUserRank(mockUserRank);
      }
    } catch (err) {
      console.error('Error fetching user rank:', err);
      setUserRank(mockUserRank);
    }
  };
  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatScore = (score) => {
    if (score === null || score === undefined || isNaN(score)) {
      return '0';
    }
    return Number(score).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        
        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Period:</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
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
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>
      </div>

      {userRank && (
        <div className="user-rank-card">
          <h3>Your Rank</h3>
          <div className="rank-info">
            <span className="rank">{getRankIcon(userRank.rank)}</span>
            <span className="score">{formatScore(userRank.score)} points</span>
            <span className="category">{userRank.category}</span>
          </div>
        </div>
      )}

      {leaderboardData.length === 0 ? (
        <div className="no-data">
          <p>No leaderboard data available.</p>
          <p>Start participating in challenges to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="rank-col">Rank</div>
            <div className="user-col">User</div>
            <div className="score-col">Score</div>
            <div className="category-col">Category</div>
            <div className="updated-col">Last Updated</div>
          </div>

          <div className="table-body">
            {leaderboardData.map((entry, index) => (
              <div 
                key={entry.id || `${entry.userId}-${index}`} 
                className={`table-row ${index < 3 ? 'top-three' : ''}`}
              >
                <div className="rank-col">
                  <span className="rank-display">
                    {getRankIcon(entry.rank || index + 1)}
                  </span>
                </div>
                <div className="user-col">
                  <div className="user-info">
                    <span className="user-id">{entry.userId}</span>
                  </div>
                </div>
                <div className="score-col">
                  <span className="score">{formatScore(entry.score)}</span>
                  <span className="points-label">points</span>
                </div>
                <div className="category-col">
                  <span className={`category-badge ${entry.category.toLowerCase()}`}>
                    {entry.category}
                  </span>
                </div>
                <div className="updated-col">
                  {formatDate(entry.lastUpdated)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="leaderboard-actions">
        <button 
          onClick={() => {
            fetchLeaderboard();
            fetchUserRank();
          }}
          className="refresh-btn"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
