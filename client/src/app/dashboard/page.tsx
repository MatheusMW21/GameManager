'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gameService } from '@/services/api';
import { BacklogGame } from '@/types/game';
import { EditGameDialog } from "@/components/EditGameDialog"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Trash2, 
  CheckCircle, 
  Gamepad2, 
  ArrowLeft, 
  Clock, 
  ClipboardList, 
  Play,
  Check,
  Search
} from "lucide-react";

export default function Dashboard() {
  const [games, setGames] = useState<BacklogGame[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que quer remover este jogo do backlog?")) return;
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
      
      const statusText = newStatus === 1 ? "Jogando" : "Zerado";
      toast.success(`Status alterado para: ${statusText}`);
    } catch (e) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleUpdateFullGame = async (updatedGame: BacklogGame) => {
    try {
      await gameService.updateGame(updatedGame.id, updatedGame);
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
      toast.success("Detalhes atualizados com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar os detalhes.");
      throw e; 
    }
  };

  const stats = {
    total: games.length,
    playing: games.filter(g => g.status === 1).length,
    completed: games.filter(g => g.status === 2).length,
    planning: games.filter(g => g.status === 0).length,
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <StatsCard title="Na Fila" value={stats.planning} icon={<ClipboardList className="text-slate-500 h-5 w-5" />} />
        </div>

        {/* Grid de Jogos */}
        {loading ? (
            <div className="flex justify-center py-20">
              <span className="text-slate-500 animate-pulse flex items-center gap-2">
                <Clock size={16} /> Carregando coleção...
              </span>
            </div>
        ) : games.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl text-slate-500 bg-slate-900/50">
                <Gamepad2 className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>Você ainda não tem jogos salvos.</p>
                <Link href="/" className="text-purple-400 hover:underline mt-2 flex items-center justify-center gap-2">
                  <Search size={16} /> Começar a explorar
                </Link>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map(game => (
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

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
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
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };
  
  const getStatusText = (s: number) => {
    if (s === 1) return "Jogando";
    if (s === 2) return "Zerado";
    return "Planejando";
  };

  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden group flex flex-col h-full hover:border-purple-500/50 transition-all shadow-md">
        <div className="relative h-40 bg-slate-950">
            {game.coverUrl ? (
                <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-600 bg-slate-900">
                  <Gamepad2 size={32} opacity={0.5} />
                </div>
            )}
            
            {/* Badge de Status */}
            <Badge variant="outline" className={`absolute top-2 right-2 backdrop-blur-md ${getStatusStyle(game.status)}`}>
                {getStatusText(game.status)}
            </Badge>

            {/* Badge de Plataforma (se não for TBD) */}
            {game.platform && game.platform !== "TBD" && (
              <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] h-5 bg-black/80 text-white border-none">
                {game.platform}
              </Badge>
            )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-white truncate mb-1 text-lg" title={game.title}>{game.title}</h3>
            
            {/* Exibe a nota se houver */}
            <div className="text-xs text-slate-500 mb-4 h-4 flex items-center gap-1">
              {game.rating ? (
                 <span className="text-yellow-500 font-bold flex items-center gap-1">
                   ★ {game.rating}/10
                 </span>
              ) : null}
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex gap-1">
                    {/* Botão Jogar */}
                    {game.status !== 1 && (
                        <Button 
                          size="icon" variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30" 
                          onClick={() => onStatusChange(1)} title="Marcar como Jogando"
                        >
                           <Play size={16} />
                        </Button>
                    )}
                    {/* Botão Zerar */}
                    {game.status !== 2 && (
                        <Button 
                          size="icon" variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-950/30" 
                          onClick={() => onStatusChange(2)} title="Marcar como Zerado"
                        >
                           <Check size={16} />
                        </Button>
                    )}
                    
                    {/* --- BOTÃO DE EDITAR (MODAL) --- */}
                    <EditGameDialog game={game} onUpdate={onUpdate} />

                </div>
                
                {/* Botão Excluir */}
                <Button 
                  size="icon" variant="ghost" 
                  className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-950/30" 
                  onClick={onDelete} title="Remover do Backlog"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    </Card>
  );
}