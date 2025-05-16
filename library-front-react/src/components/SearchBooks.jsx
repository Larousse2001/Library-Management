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
    <div>
      <select onChange={(e) => setType(e.target.value)}>
        <option value="title">Titre</option>
        <option value="author">Auteur</option>
        <option value="category">Catégorie</option>
      </select>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche" />
      <button onClick={handleSearch}>Rechercher</button>
      <ul>
        {results.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> – {book.author} [{book.category}]
          </li>
        ))}
      </ul>
    </div>
  );
}
