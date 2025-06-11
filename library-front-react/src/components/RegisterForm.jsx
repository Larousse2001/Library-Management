import React, { useState } from 'react';
import { register } from '../services/authService';

export default function RegisterForm() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role, // "ETUDIANT" ou "ADMIN"
    };

    try {
      const res = await register(data);
      alert("Registration successful!");
      console.log(res.data); // contient normalement le token
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Register</button>
    </form>
  );
}
