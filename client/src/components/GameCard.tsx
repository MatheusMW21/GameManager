'use client';

import { BacklogGame } from "@/types/game";
import { gameService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Gamepad2, 
    MoreVertical, 
    PlayCircle, 
    Trash2 
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GameCardProps {
    game: BacklogGame; 
    onUpdate?: () => void;
}

const STATUS_COLORS = {
    0: "bg-slate-700 text-slate-300", 
    1: "bg-blue-600 text-white",      
    2: "bg-emerald-600 text-white",   
    3: "bg-red-600 text-white"        
};

const STATUS_LABELS = {
    0: "Backlog",
    1: "Jogando",
    2: "Zerado",
    3: "Abandonado"
};

export function GameCard({ game, onUpdate }: GameCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus: number) => {
        setIsLoading(true);
        try {
            await gameService.update(game.id, { ...game, status: newStatus });
            toast.success("Status atualizado!");
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Erro ao atualizar status.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja remover este jogo?")) return;
        setIsLoading(true);
        try {
            await gameService.deleteGame(game.id);
            toast.success("Jogo removido.");
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Erro ao remover jogo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 flex flex-col">
            
            <div 
                className="aspect-video relative overflow-hidden cursor-pointer"
                onClick={() => router.push(`/discovery/${game.externalId || game.id}`)}
            >
                {game.coverUrl ? (
                    <img 
                        src={game.coverUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Gamepad2 className="text-slate-600 w-12 h-12"/>
                    </div>
                )}
                
                <div className="absolute top-2 right-2">
                    <Badge className={`${STATUS_COLORS[game.status as keyof typeof STATUS_COLORS]} hover:bg-opacity-80`}>
                        {STATUS_LABELS[game.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white leading-tight line-clamp-1" title={game.title}>
                        {game.title} 
                    </h3>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-slate-400 hover:text-white">
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuItem onClick={() => handleStatusChange(1)}><PlayCircle className="mr-2 h-4 w-4 text-blue-400"/> Mover para Jogando</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(2)}><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400"/> Marcar como Zerado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(0)}><Calendar className="mr-2 h-4 w-4 text-slate-400"/> Voltar para Backlog</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:text-red-400"><Trash2 className="mr-2 h-4 w-4"/> Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {game.platform || "PC"}
                    </span>
                </div>

                <div className="mt-auto pt-2">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${game.status === 2 ? 'bg-emerald-500' : game.status === 1 ? 'bg-blue-500' : 'bg-slate-700'}`} 
                            style={{ width: game.status === 2 ? '100%' : game.status === 1 ? '50%' : '5%' }}
                        />
                    </div>
                    {(game.timeMain && game.timeMain > 0) && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                            <Clock size={10} /> 
                            <span>HLTB: {game.timeMain}h</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}