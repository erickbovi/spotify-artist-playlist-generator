'use client';

import { useState, useEffect } from 'react';

export default function SudokuAuth({ onLogin }) {
  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica se já existe um usuário salvo
    const savedUser = localStorage.getItem('sudokuUser');
    if (savedUser) {
      setName(savedUser);
      setIsLoggedIn(true);
      onLogin(savedUser);
    }
  }, [onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('sudokuUser', name.trim());
      setIsLoggedIn(true);
      onLogin(name.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sudokuUser');
    setName('');
    setIsLoggedIn(false);
    onLogin(null);
  };

  if (isLoggedIn) {
    return (
      <div className="text-white/90 px-6 py-2 bg-[#474466] rounded-2xl flex items-center gap-4">
        <span>{name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-white/70 hover:text-white/90"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome"
        className="bg-[#474466] text-white/90 placeholder-white/50 px-6 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B866F9] w-48 text-lg shadow-lg"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-[#B866F9] text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
      >
        Entrar
      </button>
    </form>
  );
} 