'use client';

import { useEffect, useState } from 'react';
import { gameService } from '@/services/api';
import { BacklogGame } from '@/types/game';
import { LibraryCard } from '@/components/LibraryCard';
import Link from 'next/link';

export default function Dashboard() {
  const [games, setGames] = useState<BacklogGame[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados ao entrar na página
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await gameService.getBacklog();
      setGames(data);
    } catch (error) {
      console.error("Erro ao carregar backlog", error);
    } finally {
      setLoading(false);
    }
  };

  const total = games.length;
  const playing = games.filter(g => g.status === 1).length;
  const completed = games.filter(g => g.status === 2).length;
  const planning = games.filter(g => g.status === 0).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho e Navegação */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-white">Meu Painel</h1>
          <Link 
            href="/" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
          >
            + Novo Jogo
          </Link>
        </header>

        {/* Cards de Estatísticas (Stats) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total" value={total} color="bg-slate-800" />
          <StatCard label="Jogando" value={playing} color="bg-blue-900/50 border-blue-500/30" />
          <StatCard label="Zerados" value={completed} color="bg-green-900/50 border-green-500/30" />
          <StatCard label="Planejados" value={planning} color="bg-gray-800 border-gray-600/30" />
        </div>

        {/* Grid de Jogos */}
        {loading ? (
          <p className="text-center text-slate-500">Carregando sua coleção...</p>
        ) : games.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-400 mb-4">Seu backlog está vazio.</p>
            <Link href="/" className="text-purple-400 hover:underline">
              Clique aqui para adicionar seu primeiro jogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games.map(game => (
              <LibraryCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Componente simples para os quadradinhos de stats
function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={`${color} p-4 rounded-xl border border-slate-700/50`}>
      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}