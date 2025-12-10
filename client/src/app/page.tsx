'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gameService } from '@/services/api';
import { Game } from '@/types/game';
import { GameCard } from '@/components/GameCard';
import { Input } from "@/components/ui/input"; // Shadcn
import { Button } from "@/components/ui/button"; // Shadcn
import { Search, LayoutDashboard } from "lucide-react";

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Game<span className="text-purple-500">Backlog</span>
            </h1>
            <p className="text-slate-400">Monte sua coleção definitiva.</p>
          </div>
          
          <Link href="/dashboard">
             <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2">
                <LayoutDashboard size={18} />
                Meu Painel
             </Button>
          </Link>
        </header>

        {/* Busca Moderna */}
        <div className="max-w-xl mx-auto mb-16">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                    type="text" 
                    placeholder="Busque um jogo (ex: Silent Hill)..." 
                    className="bg-slate-900 border-slate-700 text-white h-12 text-lg focus-visible:ring-purple-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" disabled={loading} className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold">
                    {loading ? '...' : <Search />}
                </Button>
            </form>
        </div>

        {/* Grid de Resultados */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {/* Empty States */}
        {!loading && games.length === 0 && hasSearched && (
           <div className="text-center text-slate-500 mt-10">Nada encontrado.</div>
        )}
      </div>
    </main>
  );
}