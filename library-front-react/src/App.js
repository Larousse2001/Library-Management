import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import logo from "./logo.svg";
import "./App.css";

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import SearchBooks from "./components/SearchBooks";

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="Logo" />
          <h1 className="App-title">📚 Bibliothèque</h1>
        </header>

        <main className="App-main">
          {/* Home with 3 buttons */}
          <Routes>
            <Route
              path="/"
              element={
                <section className="button-group">
                  <Link to="/login">
                    <button className="btn">Login</button>
                  </Link>
                  <Link to="/register">
                    <button className="btn">Register</button>
                  </Link>
                  <Link to="/search">
                    <button className="btn">Search Books</button>
                  </Link>
                </section>
              }
            />

            {/* Routes for each component */}
            <Route
              path="/login"
              element={
                <section className="page">
                  <h2>Connexion</h2>
                  <LoginForm />
                </section>
              }
            />
            <Route
              path="/register"
              element={
                <section className="page">
                  <h2>Inscription</h2>
                  <RegisterForm />
                </section>
              }
            />
            <Route
              path="/search"
              element={
                <section className="page">
                  <h2>Recherche de Livres</h2>
                  <SearchBooks />
                </section>
              }
            />

            {/* Catch-all: redirect to home */}
            <Route
              path="*"
              element={
                <section>
                  <p>Page not found. <Link to="/">Go back home</Link></p>
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
