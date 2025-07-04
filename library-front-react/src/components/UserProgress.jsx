import React, { useState, useEffect, useCallback } from 'react';
import { userProgressService } from '../services/gamificationService';
import config from '../config/config';
import { shouldUseMockData, logError } from '../utils/errorHandler';
import './UserProgress.css';

const UserProgress = () => {
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');  // Mock data for demonstration when backend is not available
  const mockUserProgress = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      userId: 'user123',
      challengeId: 'reading-marathon',
      completedCount: 3,
      completed: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      userId: 'user123', 
      challengeId: 'study-streak',
      completedCount: 5,
      completed: true,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-19T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      userId: 'user123',
      challengeId: 'vocabulary-builder',
      completedCount: 4,
      completed: false,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    }
  ];

  // Get current user ID from localStorage or context
  const getCurrentUserId = () => {
    // This should ideally come from a user context or localStorage
    return localStorage.getItem('userId') || 'user123';
  };  const fetchUserProgress = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API, fallback to mock data if unavailable
      try {
        const response = await userProgressService.getUserProgress(userId);
        setUserProgress(response.data);
        if (config.LOG_LEVEL === 'debug') {
          console.log('Fetched user progress from API:', response.data);
        }      } catch (apiError) {
        if (shouldUseMockData(apiError)) {
          console.log('API not available, using mock data');
          setUserProgress(mockUserProgress);
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      logError(err, 'UserProgress.fetchUserProgress');
      setError(`Failed to fetch user progress: ${err.message}`);
      
      // Fallback to mock data in development
      if (shouldUseMockData(err)) {
        setUserProgress(mockUserProgress);
        setError(null); // Clear error when using mock data
      }
    } finally {
      setLoading(false);
    }
  }, [mockUserProgress]);
  useEffect(() => {
    const userId = getCurrentUserId();
    setSelectedUserId(userId);
    fetchUserProgress(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleUserIdChange = useCallback((e) => {
    const userId = e.target.value.trim();
    setSelectedUserId(userId);
    if (userId) {
      fetchUserProgress(userId);
    } else {
      setUserProgress([]);
    }
  }, [fetchUserProgress]);

  // Add refresh functionality
  const handleRefresh = useCallback(() => {
    if (selectedUserId) {
      fetchUserProgress(selectedUserId);
    }
  }, [selectedUserId, fetchUserProgress]);

  const getProgressPercentage = (currentValue, targetValue) => {
    if (!targetValue) return 0;
    return Math.min((currentValue / targetValue) * 100, 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading user progress...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-progress-container">      <div className="user-progress-header">
        <h2>🎯 User Progress</h2>
        <div className="header-controls">
          <div className="user-selector">
            <label htmlFor="userId">User ID:</label>
            <input
              type="text"
              id="userId"
              value={selectedUserId}
              onChange={handleUserIdChange}
              placeholder="Enter user ID"
            />
          </div>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={loading || !selectedUserId}
            title="Refresh progress data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {userProgress.length === 0 ? (
        <div className="no-progress">
          <p>No progress records found for this user.</p>
          <p>Start completing challenges to see your progress here!</p>
        </div>
      ) : (        <div className="progress-grid">
          {userProgress.map((progress) => (
            <div key={progress.id} className="progress-card">
              <div className="progress-header">
                <h3>{progress.challengeId || 'Unknown Challenge'}</h3>
                <span className={`status ${progress.completed ? 'completed' : 'in-progress'}`}>
                  {progress.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="progress-details">
                <div className="progress-values">
                  <span className="current">{progress.completedCount || 0}</span>
                  <span className="separator">/</span>
                  <span className="target">5</span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${getProgressPercentage(progress.completedCount || 0, 5)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="progress-percentage">
                  {getProgressPercentage(progress.completedCount || 0, 5).toFixed(1)}%
                </div>
              </div>

              <div className="progress-metadata">
                <div className="metadata-item">
                  <strong>Progress:</strong> {progress.completedCount || 0}/5 completions
                </div>
                <div className="metadata-item">
                  <strong>Started:</strong> {progress.createdAt ? formatDate(progress.createdAt) : 'N/A'}
                </div>
                <div className="metadata-item">
                  <strong>Last Update:</strong> {progress.updatedAt ? formatDate(progress.updatedAt) : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProgress;
