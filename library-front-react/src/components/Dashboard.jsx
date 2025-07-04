import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../services/bookService';
import userStatsService from '../services/userStatsService';
import { userProgressService, notificationService } from '../services/gamificationService';
import { getAllBooks } from '../services/searchService';
import './Dashboard.css';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    totalBooksRead: 0,
    totalPagesRead: 0,
    booksInProgress: 0,
    booksInWishlist: 0,
    readingStreak: 0,
    averageRating: 0,
    monthlyGoal: 12,
    monthlyProgress: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [readingGoals, setReadingGoals] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load data from actual APIs
      const [userBooksStats, userStatsData, recentBooks, userProgressData, featuredBooksData] = await Promise.allSettled([
        bookService.getStats(),
        userStatsService.getDashboardData(),
        bookService.getRecentlyAdded(5),
        userProgressService.getUserProgress(bookService.getCurrentUserId()),
        getAllBooks()
      ]);

      // Process user stats from both book service and user service
      let combinedStats = {
        totalBooksRead: 0,
        totalPagesRead: 0,
        booksInProgress: 0,
        booksInWishlist: 0,
        readingStreak: 0,
        averageRating: 0,
        monthlyGoal: 12,
        monthlyProgress: 0
      };

      if (userBooksStats.status === 'fulfilled') {
        const bookStats = userBooksStats.value;
        combinedStats = {
          ...combinedStats,
          totalBooksRead: bookStats.READ || 0,
          totalPagesRead: bookStats.totalPages || 0,
          booksInProgress: bookStats.READING || 0,
          booksInWishlist: bookStats.WISHLIST || 0,
          averageRating: bookStats.averageRating || 0
        };
      }

      if (userStatsData.status === 'fulfilled') {
        const userStats = userStatsData.value;
        combinedStats = {
          ...combinedStats,
          readingStreak: userStats.stats.readingStreak || 0,
          monthlyGoal: userStats.preferences.monthlyGoal || 12
        };
      }

      setUserStats(combinedStats);

      // Process recent activity from recent books
      if (recentBooks.status === 'fulfilled') {
        const books = recentBooks.value.content || recentBooks.value;
        const activity = books.slice(0, 4).map((book, index) => ({
          id: book.id || index,
          type: book.status === 'READ' ? 'book_finished' : 'book_added',
          title: book.title,
          date: new Date(book.dateAdded).toLocaleDateString(),
          icon: book.status === 'READ' ? '✅' : '📖'
        }));
        setRecentActivity(activity);
      }

      // Process user progress data for reading goals
      if (userProgressData.status === 'fulfilled') {
        const progressData = userProgressData.value;
        if (progressData && progressData.length > 0) {
          const goals = progressData.slice(0, 3).map(progress => ({
            id: progress.id,
            title: progress.challengeTitle || 'Reading Challenge',
            progress: Math.round((progress.currentValue / progress.targetValue) * 100),
            target: 100,
            type: progress.category || 'general'
          }));
          setReadingGoals(goals);
        } else {
          // Default goals if no progress data
          setReadingGoals([
            { id: 1, title: 'Read books this year', progress: 48, target: 100, type: 'yearly' },
            { id: 2, title: 'Daily reading habit', progress: 85, target: 100, type: 'daily' }
          ]);
        }
      }

      // Process featured books (trending from all books)
      if (featuredBooksData.status === 'fulfilled') {
        const allBooks = featuredBooksData.value;
        const featured = allBooks.slice(0, 3).map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          status: 'recommended',
          cover: '📘' // Could be enhanced with actual cover images
        }));
        setFeaturedBooks(featured);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to minimal data
      setUserStats({
        totalBooksRead: 0,
        totalPagesRead: 0,
        booksInProgress: 0,
        booksInWishlist: 0,
        readingStreak: 0,
        averageRating: 0,
        monthlyGoal: 12,
        monthlyProgress: 0
      });
      setRecentActivity([]);
      setReadingGoals([]);
      setFeaturedBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">📚</div>
        <p>Loading your library dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📚 Your Library Dashboard</h1>
        <p>Welcome back! Here's your reading progress and recommendations.</p>
      </div>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{userStats.totalBooksRead}</h3>
              <p>Books Read</p>
            </div>
          </div>
          
          <div className="stat-card secondary">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>{userStats.totalPagesRead.toLocaleString()}</h3>
              <p>Pages Read</p>
            </div>
          </div>
          
          <div className="stat-card accent">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h3>{userStats.booksInProgress}</h3>
              <p>In Progress</p>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <h3>{userStats.booksInWishlist}</h3>
              <p>Wishlist</p>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Reading Progress */}
        <section className="dashboard-card reading-progress">
          <h2>📊 Reading Progress</h2>
          <div className="monthly-goal">
            <div className="goal-header">
              <span>Monthly Goal: {userStats.monthlyProgress}/{userStats.monthlyGoal} books</span>
              <span className="goal-percentage">
                {Math.round((userStats.monthlyProgress / userStats.monthlyGoal) * 100)}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(userStats.monthlyProgress / userStats.monthlyGoal) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="additional-stats">
            <div className="stat-item">
              <span className="stat-label">🔥 Reading Streak</span>
              <span className="stat-value">{userStats.readingStreak} days</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">⭐ Average Rating</span>
              <span className="stat-value">{userStats.averageRating}/5</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/search" className="action-btn primary">
              <span className="action-icon">🔍</span>
              <span>Search Books</span>
            </Link>
            <Link to="/books" className="action-btn secondary">
              <span className="action-icon">📚</span>
              <span>My Books</span>
            </Link>
            <Link to="/gamification" className="action-btn accent">
              <span className="action-icon">🎮</span>
              <span>Achievements</span>
            </Link>
            <Link to="/leaderboard" className="action-btn warning">
              <span className="action-icon">🏆</span>
              <span>Leaderboard</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-card recent-activity">
          <h2>🔔 Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-date">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/notifications" className="view-all-link">View All Activity →</Link>
        </section>

        {/* Reading Goals */}
        <section className="dashboard-card reading-goals">
          <h2>🎯 Reading Goals</h2>
          <div className="goals-list">
            {readingGoals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-info">
                  <h4>{goal.title}</h4>
                  <div className="goal-progress">
                    <div className="goal-bar">
                      <div 
                        className="goal-fill" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span className="goal-percent">{goal.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Books */}
        <section className="dashboard-card featured-books">
          <h2>⭐ Recommended for You</h2>
          <div className="books-grid">
            {featuredBooks.map(book => (
              <div key={book.id} className="book-item">
                <div className="book-cover">{book.cover}</div>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <span className={`book-status ${book.status}`}>
                    {book.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/search" className="view-all-link">Explore More Books →</Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
