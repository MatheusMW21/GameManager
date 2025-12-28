'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; 
import { gameService } from "@/services/api";
import { BacklogGame } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { EditGameDialog } from "@/components/EditGameDialog"; 
import { GameDetailsDialog } from "@/components/GameDetailsDialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Trash2, 
    CheckCircle, 
    Gamepad2, 
    Play, 
    Search, 
    Filter, 
    XCircle, 
    Ghost, 
    Loader2, 
    Plus 
} from "lucide-react";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();  
  const [games, setGames] = useState<BacklogGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await gameService.getAll();
      setGames(data);
    } catch (error) {
      toast.error("Erro ao carregar backlog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) loadGames();
  }, [isLoaded, isSignedIn]);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
        matchesStatus = game.status.toString() === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este jogo permanentemente?")) return;
    try {
      await gameService.deleteGame(id);
      setGames(prev => prev.filter(g => g.id !== id));
      toast.success("Jogo removido.");
    } catch (e) {
      toast.error("Erro ao remover.");
    }
  };

  const handleStatusChange = async (game: BacklogGame, newStatus: number) => {
    const oldGames = [...games];
    const updatedGame = { ...game, status: newStatus };
    setGames(prev => prev.map(g => g.id === game.id ? updatedGame : g));

    try {
      await gameService.update(game.id, updatedGame);
      const statusMap: Record<number, string> = { 1: "Jogando", 2: "Zerado", 3: "Dropado" };
      toast.success(`Movido para: ${statusMap[newStatus] || "Backlog"}`);
    } catch (e) {
      setGames(oldGames);
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleUpdateFullGame = async (updatedGame: BacklogGame) => {
    setGames(prev => prev.map(g => g.id === updatedGame.id ? updatedGame : g));
    await gameService.update(updatedGame.id, updatedGame);
  };

  if (!isLoaded || loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Painel de Controle</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Bem-vindo, {user?.firstName}. Você tem <span className="text-purple-400 font-bold">{games.length}</span> jogos registrados.
                </p>
            </div>
            
            <Link href="/discovery">
                <Button className="bg-purple-600 hover:bg-purple-700 font-bold shadow-lg shadow-purple-900/20 gap-2">
                    <Plus size={18} /> Novo Jogo
                </Button>
            </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <Input 
                    placeholder="Buscar no meu backlog..." 
                    className="pl-10 h-10 bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-slate-950 border-slate-800 text-slate-200 focus:ring-purple-500">
                    <Filter className="mr-2 h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Filtrar Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="all">Todos os Jogos</SelectItem>
                    <SelectItem value="0">Planejando</SelectItem>
                    <SelectItem value="1">Jogando</SelectItem>
                    <SelectItem value="2">Zerados</SelectItem>
                    <SelectItem value="3">Dropados</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <Ghost size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-400">Nenhum jogo encontrado.</p>
                <p className="text-sm">
                    {searchTerm ? "Tente buscar com outro termo." : "Adicione jogos ao seu backlog!"}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      </main>
    </div>
  );
}

interface DashboardGameCardProps {
  game: BacklogGame;
  onDelete: () => void;
  onStatusChange: (status: number) => void;
  onUpdate: (game: BacklogGame) => Promise<void>;
}

function DashboardGameCard({ game, onDelete, onStatusChange, onUpdate }: DashboardGameCardProps) {
  
  const getStatusConfig = (s: number) => {
    switch(s) {
        case 1: return { text: "Jogando", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
        case 2: return { text: "Zerado", class: "bg-green-500/20 text-green-400 border-green-500/30" };
        case 3: return { text: "Dropado", class: "bg-red-500/20 text-red-400 border-red-500/30" };
        default: return { text: "Backlog", class: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  const statusConfig = getStatusConfig(game.status);

  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden group flex flex-col h-full hover:border-purple-500/50 transition-all shadow-md relative">
        
        <GameDetailsDialog game={game}>
            <div className="cursor-pointer h-full flex flex-col">
                <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                    {game.coverUrl ? (
                        <img 
                            src={game.coverUrl} 
                            alt={game.title} 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-700 bg-slate-950">
                            <Gamepad2 size={40} strokeWidth={1} />
                        </div>
                    )}
                    
                    <Badge variant="outline" className={`absolute top-2 right-2 backdrop-blur-md shadow-sm border ${statusConfig.class}`}>
                        {statusConfig.text}
                    </Badge>

                    {game.platform && game.platform !== "TBD" && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        {game.platform}
                    </div>
                    )}
                </div>
                
                <div className="p-3 flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                         <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors" title={game.title}>
                            {game.title}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 min-h-[20px]">
                        {game.rating && game.rating > 0 ? (
                            <span className="text-yellow-500 font-bold flex items-center gap-1">★ {game.rating}</span>
                        ) : (
                            <span className="text-slate-600 text-[10px]">Sem nota</span>
                        )}
                    </div>
                </div>
            </div>
        </GameDetailsDialog>
        
        <div className="px-3 pb-3 mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
            
            <div className="flex gap-1">
                {game.status !== 1 && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10" onClick={(e) => {e.stopPropagation(); onStatusChange(1)}} title="Marcar como Jogando">
                       <Play size={14} />
                    </Button>
                )}
                {game.status !== 2 && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-green-400 hover:bg-green-500/10" onClick={(e) => {e.stopPropagation(); onStatusChange(2)}} title="Marcar como Zerado">
                       <CheckCircle size={14} />
                    </Button>
                )}
                {game.status !== 3 && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={(e) => {e.stopPropagation(); onStatusChange(3)}} title="Marcar como Dropado">
                       <XCircle size={14} />
                    </Button>
                )}
            </div>
            
            <div className="flex gap-1 border-l border-slate-800 pl-1 ml-1" onClick={(e) => e.stopPropagation()}>
                <EditGameDialog game={game} onUpdate={onUpdate} />
                
                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-600 hover:text-red-500 hover:bg-red-500/10" onClick={onDelete} title="Excluir">
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    </Card>
  );
}