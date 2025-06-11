import React, { useState } from 'react';
import { searchByTitle, searchByAuthor, searchByCategory } from '../services/searchService';

export default function SearchBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [type, setType] = useState('title');

  const handleSearch = async () => {
    let res;
    if (type === 'title') res = await searchByTitle(query);
    if (type === 'author') res = await searchByAuthor(query);
    if (type === 'category') res = await searchByCategory(query);
    setResults(res.data);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🔍 Rechercher un livre</h2>
      <div style={styles.controls}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.select}
        >
          <option value="title">Titre</option>
          <option value="author">Auteur</option>
          <option value="category">Catégorie</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherche"
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Rechercher
        </button>
      </div>

      <ul style={styles.results}>
        {results.map((book) => (
          <li key={book.id} style={styles.resultItem}>
            <strong>{book.title}</strong> – {book.author} <span style={styles.category}>[{book.category}]</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  controls: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    minWidth: '120px',
  },
  input: {
    flex: '1',
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    minWidth: '150px',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  results: {
    listStyle: 'none',
    padding: 0,
    marginTop: '1rem',
  },
  resultItem: {
    padding: '0.75rem',
    borderBottom: '1px solid #eee',
  },
  category: {
    color: '#777',
    fontSize: '0.9rem',
  },
};
