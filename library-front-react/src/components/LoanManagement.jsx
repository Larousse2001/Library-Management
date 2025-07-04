import React, { useState, useEffect } from 'react';
import loanService from '../services/loanService';
import { getCurrentUserId, isAuthenticated } from '../utils/authUtils';
import './LoanManagement.css';

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Load user's loans and statistics
      const [loansResponse, activeResponse, overdueResponse, statsResponse] = await Promise.all([
        loanService.getUserLoans(userId),
        loanService.getActiveLoans(),
        loanService.getOverdueLoans(),
        loanService.getUserStats(userId)
      ]);

      setLoans(loansResponse.data);
      setActiveLoans(activeResponse.data);
      setOverdueLoans(overdueResponse.data);
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading loan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        alert('Please log in to borrow books.');
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        alert('Unable to get user information. Please log in again.');
        return;
      }

      const borrowData = {
        userId: parseInt(userId),
        bookId: parseInt(bookId)
      };

      await loanService.borrowBook(borrowData);
      loadUserData(); // Refresh data
      alert('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      if (error.response?.status === 401) {
        alert('Please log in to borrow books.');
      } else if (error.response?.status === 409) {
        alert('You have already borrowed this book.');
      } else {
        alert('Failed to borrow book. Please try again.');
      }
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await loanService.returnBook(loanId);
      loadUserData(); // Refresh data
      alert('Book returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return 'N/A';
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days remaining`;
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'RETURNED') return 'success';
    if (status === 'OVERDUE') return 'danger';
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'danger';
    if (diffDays <= 3) return 'warning';
    return 'primary';
  };

  if (loading) {
    return (
      <div className="loan-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading loan information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-management">
      <div className="loan-header">
        <h1>📚 Loan Management</h1>
        <p>Manage your borrowed books and track reading history.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{userStats.totalBorrowings || 0}</h3>
            <p>Total Books Borrowed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{userStats.returnedBooks || 0}</h3>
            <p>Books Returned</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{userStats.activeBorrowings || 0}</h3>
            <p>Currently Borrowed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{userStats.recentReturns || 0}</h3>
            <p>Recent Returns (30 days)</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${selectedTab === 'active' ? 'active' : ''}`}
          onClick={() => setSelectedTab('active')}
        >
          Active Loans ({userStats.activeBorrowings || 0})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'history' ? 'active' : ''}`}
          onClick={() => setSelectedTab('history')}
        >
          Loan History
        </button>
        <button
          className={`tab-btn ${selectedTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overdue')}
        >
          Overdue ({overdueLoans.length})
        </button>
      </div>

      {/* Content based on selected tab */}
      <div className="tab-content">
        {selectedTab === 'active' && (
          <div className="active-loans">
            <h2>📖 Active Loans</h2>
            {activeLoans.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No Active Loans</h3>
                <p>You don't have any books currently borrowed.</p>
              </div>
            ) : (
              <div className="loans-grid">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="loan-card active">
                    <div className="loan-header">
                      <h4>Book ID: {loan.bookId}</h4>
                      <span className={`status-badge ${getStatusColor(loan.status, loan.dueDate)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="loan-details">
                      <p><strong>Borrowed:</strong> {formatDate(loan.borrowDate)}</p>
                      <p><strong>Due:</strong> {formatDate(loan.dueDate)}</p>
                      <p><strong>Status:</strong> {getDaysRemaining(loan.dueDate)}</p>
                      {loan.renewalCount > 0 && (
                        <p><strong>Renewals:</strong> {loan.renewalCount}</p>
                      )}
                    </div>
                    <div className="loan-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleReturnBook(loan.id)}
                      >
                        📤 Return Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="loan-history">
            <h2>📜 Loan History</h2>
            {loans.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Loan History</h3>
                <p>You haven't borrowed any books yet.</p>
              </div>
            ) : (
              <div className="loans-table">
                <table>
                  <thead>
                    <tr>
                      <th>Book ID</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td>#{loan.bookId}</td>
                        <td>{formatDate(loan.borrowDate)}</td>
                        <td>{formatDate(loan.dueDate)}</td>
                        <td>{formatDate(loan.returnDate)}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(loan.status, loan.dueDate)}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td>
                          {loan.returnDate && loan.borrowDate
                            ? `${Math.ceil((new Date(loan.returnDate) - new Date(loan.borrowDate)) / (1000 * 60 * 60 * 24))} days`
                            : 'Ongoing'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'overdue' && (
          <div className="overdue-loans">
            <h2>⚠️ Overdue Books</h2>
            {overdueLoans.length === 0 ? (
              <div className="empty-state success">
                <div className="empty-icon">✅</div>
                <h3>No Overdue Books</h3>
                <p>Great! You have no overdue books.</p>
              </div>
            ) : (
              <div className="loans-grid">
                {overdueLoans.map((loan) => (
                  <div key={loan.id} className="loan-card overdue">
                    <div className="loan-header">
                      <h4>Book ID: {loan.bookId}</h4>
                      <span className="status-badge danger">OVERDUE</span>
                    </div>
                    <div className="loan-details">
                      <p><strong>Borrowed:</strong> {formatDate(loan.borrowDate)}</p>
                      <p><strong>Was Due:</strong> {formatDate(loan.dueDate)}</p>
                      <p className="overdue-text">
                        <strong>{getDaysRemaining(loan.dueDate)}</strong>
                      </p>
                      {loan.fineAmount > 0 && (
                        <p className="fine-amount">
                          <strong>Fine:</strong> ${loan.fineAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="loan-actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReturnBook(loan.id)}
                      >
                        📤 Return Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
