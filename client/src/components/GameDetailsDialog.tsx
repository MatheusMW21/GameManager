'use client';

import { BacklogGame } from "@/types/game";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { SteamPriceBadge } from "./SteamPriceBadge";
import { Gamepad2, Star, Quote, AlertOctagon, ExternalLink, Clock, Trophy, BookOpen, History } from "lucide-react";

const STATUS_CONFIG = {
  0: { label: "Wishlist", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  1: { label: "Jogando", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  2: { label: "Zerado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  3: { label: "Dropado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const TimeCard = ({ icon: Icon, label, time, isGoal }: any) => (
  <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center gap-1 relative transition-all ${
    isGoal 
      ? "bg-purple-900/20 border-purple-500/50 scale-105 shadow-lg shadow-purple-900/20 z-10" 
      : "bg-slate-900/50 border-slate-800 opacity-60 grayscale hover:grayscale-0"
  }`}>
    {isGoal && (
      <div className="absolute -top-2 bg-purple-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
        Meta
      </div>
    )}
    <Icon size={16} className={isGoal ? "text-purple-400" : "text-slate-500"} />
    <span className="text-[10px] uppercase text-slate-400 font-semibold">{label}</span>
    <span className="text-lg font-bold text-white leading-none">{time || 0}h</span>
  </div>
);

interface GameDetailsDialogProps {
  game: BacklogGame;
  children: React.ReactNode; 
}

export function GameDetailsDialog({ game, children }: GameDetailsDialogProps) {
  const timeMain = game.timeMain || 0;
  const timeExtra = game.timeExtra || 0;
  const timeCompletionist = game.timeCompletionist || 0;
  const playedTime = game.timePlayed || 0;

  const getTargetTime = () => {
      if (game.myGoal === 0) return timeMain; 
      if (game.myGoal === 2) return timeCompletionist; 
      return timeExtra; 
  };

  const targetTime = getTargetTime() || 1; 
  const progressPercent = Math.min(100, Math.round((playedTime / targetTime) * 100));
  
  const statusInfo = STATUS_CONFIG[game.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0];

  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer transition-opacity hover:opacity-80">
        {children}
      </DialogTrigger>
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[750px] overflow-hidden p-0 gap-0">
        
        {/* Banner com Gradient Overlay */}
        <div className="h-32 w-full relative bg-[#0f172a]">
           {game.coverUrl && (
             <div 
               className="absolute inset-0 bg-cover bg-center opacity-40 mask-image-gradient"
               style={{ backgroundImage: `url(${game.coverUrl})` }}
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
        </div>

        <div className="px-6 pb-6 -mt-12 flex gap-6 items-start relative z-10">
            
            {/* CAPA */}
            <div className="flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-950 w-32 h-48 bg-slate-900 aspect-[2/3]">
                {game.coverUrl ? (
                    <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Gamepad2 size={40} />
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className="flex-1 pt-14 text-left">
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-3xl font-bold mb-2 leading-tight text-white">{game.title}</DialogTitle>
                        
                        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
                            <Badge variant="outline" className={statusInfo.color}>
                                {statusInfo.label}
                            </Badge>

                            <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                                <Gamepad2 size={12} /> {game.platform || "TBD"}
                            </span>
                            
                            {game.steamAppId && (
                                <>
                                  <SteamPriceBadge steamId={game.steamAppId} />
                                  <a href={`https://store.steampowered.com/app/${game.steamAppId}`} target="_blank" rel="noopener noreferrer">
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 gap-1">
                                          Steam <ExternalLink size={10} />
                                      </Button>
                                  </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Nota */}
                    {game.rating && game.rating > 0 && (
                        <div className="flex flex-col items-end pl-4">
                            <span className="text-yellow-500 font-bold text-3xl flex items-center gap-1">
                                {game.rating}<span className="text-sm text-slate-600">/10</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* PROGRESSO */}
                <div className="mt-8 space-y-4">
                    {playedTime > 0 && (
                        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
                                        <History size={14} className="text-purple-400"/> Tempo Jogado
                                    </span>
                                    <div className="text-xl font-bold text-white flex items-baseline gap-2">
                                        {playedTime}h
                                        <span className="text-xs text-slate-500 font-normal">de {targetTime}h estimados</span>
                                    </div>
                                </div>
                                <span className="text-purple-400 font-bold text-lg">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    )}

                    {/* GRID HLTB */}
                    {(timeMain > 0 || timeExtra > 0 || timeCompletionist > 0) && (
                        <div>
                             {!playedTime && ( 
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Clock size={14} /> Tempo Estimado (HLTB)
                                </h4>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                                <TimeCard icon={BookOpen} label="História" time={timeMain} isGoal={game.myGoal === 0} />
                                <TimeCard icon={Clock} label="Extra" time={timeExtra} isGoal={game.myGoal === 1} />
                                <TimeCard icon={Trophy} label="Platina" time={timeCompletionist} isGoal={game.myGoal === 2} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Comentários / Drop */}
                <div className="space-y-4 mt-6">
                    {game.status === 3 && game.droppedReason && (
                        <div className="bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r">
                            <h4 className="text-red-400 font-bold flex items-center gap-2 mb-1 text-sm uppercase tracking-wider">
                                <AlertOctagon size={14} /> Motivo da Desistência
                            </h4>
                            <p className="text-slate-300 italic">"{game.droppedReason}"</p>
                        </div>
                    )}
                    {game.comments && (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-slate-500 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                                <Quote size={12} /> Minhas Anotações
                            </h4>
                            <ScrollArea className="max-h-[200px]">
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{game.comments}</p>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}