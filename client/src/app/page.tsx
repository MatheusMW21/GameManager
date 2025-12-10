'use client';

import { useState } from 'react';
import { gameService } from '../services/api';
import { Game } from '../types/game';
import { GameCard } from '../components/GameCard';
import "./global.css";

export default function Home() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await gameService.searchGames(query);
      setGames(results);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Game Backlog
          </h1>
          <p className="text-slate-400">Gerencie sua coleção e descubra novos jogos</p>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16 flex gap-2">
          <input
            type="text"
            placeholder="O que vamos jogar hoje? (Ex: Elden Ring)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-purple-500 transition shadow-inner"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {games.length === 0 && !loading && (
          <div className="text-center text-slate-600 mt-20">
            <p>Nenhum jogo buscado ainda.</p>
          </div>
        )}
      </div>
    </main>
  );
}