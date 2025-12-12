'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gameService } from '@/services/api';
import { BacklogGame } from '@/types/game';
import { EditGameDialog } from "@/components/EditGameDialog"; 
import { GameDetailsDialog } from "@/components/GameDetailsDialog"; 
import { SteamPriceBadge } from "@/components/SteamPriceBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Trash2, CheckCircle, Gamepad2, ArrowLeft, Clock, ClipboardList, 
  Play, Check, Search, Filter, XCircle 
} from "lucide-react";

export default function Dashboard() {
  const [games, setGames] = useState<BacklogGame[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado do Filtro ('ALL', 'PLANNING', 'PLAYING', 'COMPLETED', 'DROPPED')
  const [filter, setFilter] = useState("ALL");

  const loadGames = async () => {
    try {
      const data = await gameService.getBacklog();
      setGames(data);
    } catch (error) {
      toast.error("Erro ao carregar seu backlog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGames(); }, []);

  // --- LÓGICA DE FILTRO ---
  const filteredGames = games.filter(game => {
    if (filter === "ALL") return true;
    if (filter === "PLANNING") return game.status === 0;
    if (filter === "PLAYING") return game.status === 1;
    if (filter === "COMPLETED") return game.status === 2;
    if (filter === "DROPPED") return game.status === 3;
    return true;
  });

  // --- AÇÕES ---
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que quer remover este jogo permanentemente?")) return;
    try {
      await gameService.deleteGame(id);
      setGames(games.filter(g => g.id !== id));
      toast.success("Jogo removido.");
    } catch (e) {
      toast.error("Erro ao remover.");
    }
  };

  const handleStatusChange = async (game: BacklogGame, newStatus: number) => {
    try {
      const updatedGame = { ...game, status: newStatus };
      await gameService.updateGame(game.id, updatedGame);
      setGames(games.map(g => g.id === game.id ? updatedGame : g));
      
      let statusText = "Atualizado";
      if (newStatus === 1) statusText = "Status: Jogando";
      if (newStatus === 2) statusText = "Status: Zerado";
      if (newStatus === 3) statusText = "Status: Dropado";
      
      toast.success(statusText);
    } catch (e) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleUpdateFullGame = async (updatedGame: BacklogGame) => {
    try {
      await gameService.updateGame(updatedGame.id, updatedGame);
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
      toast.success("Detalhes atualizados!");
    } catch (e) {
      toast.error("Erro ao salvar.");
      throw e; 
    }
  };

  // --- ESTATÍSTICAS ---
  const stats = {
    total: games.length,
    playing: games.filter(g => g.status === 1).length,
    completed: games.filter(g => g.status === 2).length,
    planning: games.filter(g => g.status === 0).length,
    dropped: games.filter(g => g.status === 3).length
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Meu Painel</h1>
          </div>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold shadow-lg shadow-purple-900/20">
              + Novo Jogo
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total" value={stats.total} icon={<Gamepad2 className="text-purple-500 h-5 w-5" />} />
          <StatsCard title="Jogando" value={stats.playing} icon={<Clock className="text-blue-500 h-5 w-5" />} />
          <StatsCard title="Zerados" value={stats.completed} icon={<CheckCircle className="text-green-500 h-5 w-5" />} />
          <StatsCard title="Wishlist" value={stats.planning} icon={<ClipboardList className="text-slate-500 h-5 w-5" />} />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
           <FilterButton label="Todos" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
           <FilterButton label="Jogando" active={filter === "PLAYING"} onClick={() => setFilter("PLAYING")} count={stats.playing} />
           <FilterButton label="Zerados" active={filter === "COMPLETED"} onClick={() => setFilter("COMPLETED")} count={stats.completed} />
           <FilterButton label="Wishlist" active={filter === "PLANNING"} onClick={() => setFilter("PLANNING")} count={stats.planning} />
           <FilterButton label="Dropados" active={filter === "DROPPED"} onClick={() => setFilter("DROPPED")} count={stats.dropped}/>
        </div>

        {/* Grid de Jogos */}
        {loading ? (
            <div className="flex justify-center py-20">
              <span className="text-slate-500 animate-pulse flex items-center gap-2">
                <Clock size={16} /> Carregando...
              </span>
            </div>
        ) : filteredGames.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl text-slate-500 bg-slate-900/50">
                <Filter className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum jogo encontrado neste filtro.</p>
                {filter !== "ALL" && (
                   <Button variant="link" onClick={() => setFilter("ALL")} className="text-purple-400">Ver todos</Button>
                )}
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredGames.map(game => (
              <DashboardGameCard 
                key={game.id} 
                game={game} 
                onDelete={() => handleDelete(game.id)}
                onStatusChange={(status) => handleStatusChange(game, status)}
                onUpdate={handleUpdateFullGame}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// --- SUB-COMPONENTES ---

function FilterButton({ label, active, onClick, count }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border
                ${active 
                    ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20" 
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
        >
            {label}
            {count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-purple-500/50" : "bg-slate-800"}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

function StatsCard({ title, value, icon }: any) {
  return (
    <Card className="bg-slate-900 border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white truncate">{value}</div>
      </CardContent>
    </Card>
  );
}

interface DashboardGameCardProps {
  game: BacklogGame;
  onDelete: () => void;
  onStatusChange: (status: number) => void;
  onUpdate: (game: BacklogGame) => Promise<void>;
}

function DashboardGameCard({ game, onDelete, onStatusChange, onUpdate }: DashboardGameCardProps) {
  
  const getStatusStyle = (s: number) => {
    if (s === 1) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (s === 2) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === 3) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };
  
  const getStatusText = (s: number) => {
    if (s === 1) return "Jogando";
    if (s === 2) return "Zerado";
    if (s === 3) return "Dropado";
    return "Wishlist";
  };

  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden group flex flex-col h-full hover:border-purple-500/50 transition-all shadow-md">
        
        {/* ENVOLVEMOS A IMAGEM COM O MODAL DE DETALHES */}
        <GameDetailsDialog game={game}>
            <div className="relative h-40 bg-slate-950 cursor-pointer">
                {game.coverUrl ? (
                    <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 bg-slate-900">
                    <Gamepad2 size={32} opacity={0.5} />
                    </div>
                )}
                
                <Badge variant="outline" className={`absolute top-2 right-2 backdrop-blur-md ${getStatusStyle(game.status)}`}>
                    {getStatusText(game.status)}
                </Badge>

                {game.platform && game.platform !== "TBD" && (
                <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] h-5 bg-black/80 text-white border-none">
                    {game.platform}
                </Badge>
                )}
            </div>
        </GameDetailsDialog>
        
        <div className="p-4 flex-1 flex flex-col">
            {/* ENVOLVEMOS O TÍTULO TAMBÉM */}
            <GameDetailsDialog game={game}>
                <h3 className="font-bold text-white truncate mb-1 text-lg cursor-pointer hover:text-purple-400 transition-colors" title={game.title}>
                    {game.title}
                </h3>
            </GameDetailsDialog>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 h-5">
              {game.rating && game.rating > 0 ? (
                 <span className="text-yellow-500 font-bold flex items-center gap-1">★ {game.rating}</span>
              ) : null}

              {/* LÓGICA DE PREÇO AUTOMÁTICO - Só wishlist (0) */}
              {game.status === 0 && game.steamAppId && (
                 <SteamPriceBadge steamId={game.steamAppId} />
              )}
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex gap-1">
                    {/* Botões de Ação */}
                    {game.status !== 1 && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30" onClick={() => onStatusChange(1)} title="Jogar">
                           <Play size={16} />
                        </Button>
                    )}
                    {game.status !== 2 && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-950/30" onClick={() => onStatusChange(2)} title="Zerar">
                           <Check size={16} />
                        </Button>
                    )}
                    {/* Botão DROP */}
                    {game.status !== 3 && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30" onClick={() => onStatusChange(3)} title="Dropar (Desistir)">
                           <XCircle size={16} />
                        </Button>
                    )}
                    
                    <EditGameDialog game={game} onUpdate={onUpdate} />
                </div>
                
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-950/30" onClick={onDelete} title="Excluir Permanentemente">
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    </Card>
  );
}