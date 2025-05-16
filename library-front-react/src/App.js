import logo from "./logo.svg";
import "./App.css";

import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import SearchBooks from "./components/SearchBooks";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1
            className="App-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Bibliothèque
          </h1>
        </header>
      </div>
      <div>
        {!token ? (
          <>
            <h2>Login</h2>
            <LoginForm onLogin={setToken} />
            <h2>Register</h2>
            <RegisterForm />
          </>
        ) : (
          <>
            <h2>Recherche de Livres</h2>
            <SearchBooks />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
