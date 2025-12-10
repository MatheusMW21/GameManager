'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gameService } from '@/services/api';
import { Game } from '@/types/game';
import { GameCard } from '@/components/GameCard';

export default function Home() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const results = await gameService.searchGames(query);
      setGames(results);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      alert("Falha na comunicação com o servidor. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header com Link para o Dashboard */}
        <header className="mb-12 text-center relative">
          <div className="absolute top-0 right-0">
             <Link 
               href="/dashboard" 
               className="text-sm font-bold text-slate-400 hover:text-purple-400 transition flex items-center gap-1"
             >
                Ver Meu Backlog &rarr;
             </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Game Backlog
          </h1>
          <p className="text-slate-400">Gerencie sua coleção e descubra novos jogos</p>
        </header>

        {/* Barra de Busca */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16 flex gap-2">
          <input
            type="text"
            placeholder="O que vamos jogar hoje? (Ex: Elden Ring)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-purple-500 transition shadow-inner placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {/* Grid de Resultados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {/* Mensagens de Feedback (Vazio ou Sem Resultados) */}
        {!loading && games.length === 0 && hasSearched && (
           <div className="text-center text-slate-500 mt-10">
             <p>Nenhum jogo encontrado para "{query}".</p>
           </div>
        )}

        {!hasSearched && (
            <div className="text-center text-slate-600 mt-20 opacity-50">
                <p>Digite o nome de um jogo acima para começar.</p>
            </div>
        )}

      </div>
    </main>
  );
}