'use client';

import { BacklogGame } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { SteamPriceBadge } from "./SteamPriceBadge";
import { Gamepad2, Star, Quote, AlertOctagon, ExternalLink } from "lucide-react";

interface GameDetailsDialogProps {
  game: BacklogGame;
  children: React.ReactNode; 
}

export function GameDetailsDialog({ game, children }: GameDetailsDialogProps) {
  
  const getStatusColor = (s: number) => {
    if (s === 1) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s === 2) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (s === 3) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const getStatusText = (s: number) => {
    if (s === 1) return "Jogando";
    if (s === 2) return "Zerado";
    if (s === 3) return "Dropado";
    return "Wishlist";
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer transition-opacity hover:opacity-80">
        {children}
      </DialogTrigger>
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[750px] overflow-hidden p-0 gap-0">
        
        {/* Banner (Apenas decorativo agora) */}
        <div 
            className="h-32 w-full bg-cover bg-center opacity-40 mask-image-gradient"
            style={{ 
                backgroundImage: game.coverUrl ? `url(${game.coverUrl})` : undefined,
                backgroundColor: '#0f172a' 
            }}
        />

        {/* Conteúdo Principal (Layout Flex) */}
        <div className="px-6 pb-6 -mt-12 flex gap-6 items-start relative z-10">
            
            {/* COLUNA 1: CAPA (Fica na esquerda) */}
            <div className="flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-950 w-32 h-48 bg-slate-900">
                {game.coverUrl ? (
                    <img 
                        src={game.coverUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Gamepad2 size={40} />
                    </div>
                )}
            </div>

            <div className="flex-1 pt-14 text-left"> 
                
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-3xl font-bold mb-2 leading-tight text-white text-left">
                            {game.title}
                        </DialogTitle>
                        
                        {/* Tags / Metadados */}
                        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400 justify-start">
                            
                            <Badge variant="outline" className={`${getStatusColor(game.status)}`}>
                                {getStatusText(game.status)}
                            </Badge>

                            <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                                <Gamepad2 size={12} /> {game.platform || "TBD"}
                            </span>
                            
                            {game.steamAppId && (
                                <SteamPriceBadge steamId={game.steamAppId} />
                            )}

                            {game.steamAppId && (
                                <a 
                                    href={`https://store.steampowered.com/app/${game.steamAppId}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 gap-1">
                                        Steam <ExternalLink size={10} />
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Nota (Fica na direita, mas separada pelo flex justify-between) */}
                    {game.rating && game.rating > 0 ? (
                        <div className="flex flex-col items-end pl-4">
                            <span className="text-yellow-500 font-bold text-3xl flex items-center gap-1">
                                {game.rating}<span className="text-sm text-slate-600">/10</span>
                            </span>
                            <div className="flex text-yellow-500/50">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < (game.rating! / 2) ? "currentColor" : "none"} />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Seção de Conteúdo (Review / Drop) */}
                <div className="space-y-4 mt-6 text-left">
                    
                    {game.status === 3 && game.droppedReason && (
                        <div className="bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r animate-in slide-in-from-left-2">
                            <h4 className="text-red-400 font-bold flex items-center gap-2 mb-1 text-sm uppercase tracking-wider">
                                <AlertOctagon size={14} /> Motivo da Desistência
                            </h4>
                            <p className="text-slate-300 italic">"{game.droppedReason}"</p>
                        </div>
                    )}

                    {game.comments ? (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-slate-500 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                                <Quote size={12} /> Minhas Anotações
                            </h4>
                            <ScrollArea className="max-h-[200px]">
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                    {game.comments}
                                </p>
                            </ScrollArea>
                        </div>
                    ) : (
                        !game.droppedReason && (
                            <p className="text-slate-600 italic text-sm mt-4">
                                Nenhuma anotação registrada.
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}