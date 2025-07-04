import React, { useState, useEffect } from 'react';
import bookService from '../services/bookService';
import './BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, read, reading, wishlist
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, title, author, rating
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserBooks();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, filter, sortBy, searchTerm]);

  const loadUserBooks = async () => {
    try {
      setIsLoading(true);
      
      const booksData = await bookService.getAllBooks();
      const userBooks = booksData.content || booksData;
      
      // Transform the data to match component expectations
      const transformedBooks = userBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status?.toLowerCase() || 'wishlist',
        progress: book.progress || 0,
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage || 0,
        rating: book.rating || 0,
        dateAdded: book.dateAdded || new Date().toISOString().split('T')[0],
        dateStarted: book.dateStarted,
        dateFinished: book.dateFinished,
        notes: book.notes || '',
        category: book.category || 'Uncategorized',
        cover: book.cover || '�'
      }));
      
      setBooks(transformedBooks);
    } catch (error) {
      console.error('Error loading user books:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBooks = () => {
    let filtered = books;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(book => book.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating;
        case 'dateAdded':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    setFilteredBooks(filtered);
  };

  const updateBookStatus = async (bookId, newStatus) => {
    try {
      await bookService.updateBook(bookId, { 
        status: newStatus.toUpperCase(),
        dateStarted: newStatus === 'reading' ? new Date().toISOString().split('T')[0] : undefined,
        dateFinished: newStatus === 'read' ? new Date().toISOString().split('T')[0] : undefined,
        progress: newStatus === 'read' ? 100 : undefined
      });
      
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId
            ? {
                ...book,
                status: newStatus,
                dateStarted: newStatus === 'reading' && !book.dateStarted ? new Date().toISOString().split('T')[0] : book.dateStarted,
                dateFinished: newStatus === 'read' ? new Date().toISOString().split('T')[0] : null,
                progress: newStatus === 'read' ? 100 : book.progress,
                currentPage: newStatus === 'read' ? book.totalPages : book.currentPage
              }
            : book
        )
      );
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Failed to update book status. Please try again.');
    }
  };

  const updateBookProgress = async (bookId, newProgress, newCurrentPage) => {
    try {
      await bookService.updateBook(bookId, {
        progress: newProgress,
        currentPage: newCurrentPage,
        status: newProgress === 100 ? 'READ' : 'READING',
        dateFinished: newProgress === 100 ? new Date().toISOString().split('T')[0] : null
      });
      
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId
            ? {
                ...book,
                progress: newProgress,
                currentPage: newCurrentPage,
                status: newProgress === 100 ? 'read' : 'reading',
                dateFinished: newProgress === 100 ? new Date().toISOString().split('T')[0] : null
              }
            : book
        )
      );
    } catch (error) {
      console.error('Error updating book progress:', error);
      alert('Failed to update book progress. Please try again.');
    }
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to remove this book from your library?')) {
      try {
        await bookService.deleteBook(bookId);
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  const openEditModal = (book) => {
    setSelectedBook({ ...book });
    setShowEditModal(true);
  };

  const saveBookChanges = async () => {
    try {
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === selectedBook.id ? selectedBook : book
        )
      );
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error('Error saving book changes:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read': return '✅';
      case 'reading': return '📖';
      case 'wishlist': return '❤️';
      default: return '📚';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'read': return 'success';
      case 'reading': return 'primary';
      case 'wishlist': return 'warning';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="book-management-loading">
        <div className="loading-spinner">📚</div>
        <p>Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="book-management">
      <div className="book-management-header">
        <h1>📚 My Library</h1>
        <p>Manage your personal book collection and track your reading progress.</p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Books ({books.length})</option>
            <option value="read">Read ({books.filter(b => b.status === 'read').length})</option>
            <option value="reading">Currently Reading ({books.filter(b => b.status === 'reading').length})</option>
            <option value="wishlist">Wishlist ({books.filter(b => b.status === 'wishlist').length})</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="dateAdded">Sort by Date Added</option>
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="library-stats">
        <div className="stat-item">
          <span className="stat-number">{books.filter(b => b.status === 'read').length}</span>
          <span className="stat-label">Books Read</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{books.filter(b => b.status === 'reading').length}</span>
          <span className="stat-label">Currently Reading</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{books.filter(b => b.status === 'wishlist').length}</span>
          <span className="stat-label">Wishlist</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{books.reduce((sum, book) => sum + book.currentPage, 0)}</span>
          <span className="stat-label">Total Pages Read</span>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {filteredBooks.length === 0 ? (
          <div className="no-books">
            <p>📚 No books found matching your criteria.</p>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                <span className="cover-icon">{book.cover}</span>
                <span className={`status-badge ${getStatusColor(book.status)}`}>
                  {getStatusIcon(book.status)} {book.status}
                </span>
              </div>

              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <p className="category">{book.category}</p>

                {book.status !== 'wishlist' && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {book.currentPage} / {book.totalPages} pages ({book.progress}%)
                    </p>
                  </div>
                )}

                {book.rating > 0 && (
                  <div className="rating">
                    {'⭐'.repeat(book.rating)}
                    <span className="rating-text">({book.rating}/5)</span>
                  </div>
                )}
              </div>

              <div className="book-actions">
                {book.status === 'wishlist' && (
                  <button
                    onClick={() => updateBookStatus(book.id, 'reading')}
                    className="action-btn primary"
                  >
                    Start Reading
                  </button>
                )}

                {book.status === 'reading' && (
                  <>
                    <button
                      onClick={() => updateBookStatus(book.id, 'read')}
                      className="action-btn success"
                    >
                      Mark as Read
                    </button>
                    <button
                      onClick={() => openEditModal(book)}
                      className="action-btn secondary"
                    >
                      Update Progress
                    </button>
                  </>
                )}

                {book.status === 'read' && (
                  <button
                    onClick={() => openEditModal(book)}
                    className="action-btn secondary"
                  >
                    Edit Details
                  </button>
                )}

                <button
                  onClick={() => deleteBook(book.id)}
                  className="action-btn danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBook && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Book Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={selectedBook.status}
                  onChange={(e) => setSelectedBook({ ...selectedBook, status: e.target.value })}
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="reading">Reading</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {selectedBook.status !== 'wishlist' && (
                <div className="form-group">
                  <label>Current Page:</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedBook.totalPages}
                    value={selectedBook.currentPage}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value) || 0;
                      const progress = Math.round((newPage / selectedBook.totalPages) * 100);
                      setSelectedBook({
                        ...selectedBook,
                        currentPage: newPage,
                        progress: progress
                      });
                    }}
                  />
                  <span className="page-info">of {selectedBook.totalPages} pages</span>
                </div>
              )}

              {selectedBook.status === 'read' && (
                <div className="form-group">
                  <label>Rating:</label>
                  <select
                    value={selectedBook.rating}
                    onChange={(e) => setSelectedBook({ ...selectedBook, rating: parseInt(e.target.value) })}
                  >
                    <option value="0">No Rating</option>
                    <option value="1">⭐ (1/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={selectedBook.notes}
                  onChange={(e) => setSelectedBook({ ...selectedBook, notes: e.target.value })}
                  placeholder="Add your notes about this book..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveBookChanges}
                className="btn primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
