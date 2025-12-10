'use client'; 

import { useState } from 'react';
import { Game } from "@/types/game";
import { gameService } from '@/services/api';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Check, Loader2 } from "lucide-react"; 

interface GameCardProps {
    game: Game;
}

export function GameCard({ game }: GameCardProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleAdd = async () => {
        const gameId = game.id || (game as any).Id;

        if (!gameId) {
            console.error("ERRO CRÍTICO: Jogo sem ID identificado.", game);
            toast.error("Erro: Não foi possível identificar o ID deste jogo.");
            return;
        }

        setIsSaving(true);
        try {
            console.log("Salvando jogo:", game.name, "ID:", gameId); // Debug

            await gameService.addToBacklog({
                title: game.name,
                coverUrl: game.cover?.url,
                externalId: gameId.toString(), // Usa o ID seguro que pegamos acima
                platform: "TBD",
                status: 0 
            });
            
            setIsSaved(true);
            toast.success(`${game.name} adicionado ao backlog!`);
            
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar. Verifique se o Backend está rodando.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col h-full hover:border-purple-500 transition-colors group shadow-lg">
            
            <div className="relative w-full aspect-[3/4] bg-slate-950 overflow-hidden">
                {game.cover ? (
                    <img 
                        src={game.cover.url} 
                        alt={game.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                        Sem Capa
                    </div>
                )}
                
                {game.releaseDate && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-mono">
                        {new Date(game.releaseDate).getFullYear()}
                    </div>
                )}
            </div>

            <CardContent className="p-4 flex-1 flex flex-col justify-start">
                <h3 className="font-bold text-slate-100 text-lg leading-tight line-clamp-2" title={game.name}>
                    {game.name}
                </h3>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button 
                    onClick={handleAdd}
                    disabled={isSaving || isSaved}
                    className={`w-full font-bold transition-all ${
                        isSaved 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                >
                    {isSaving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                    ) : isSaved ? (
                        <><Check className="mr-2 h-4 w-4" /> Salvo</>
                    ) : (
                        <><Plus className="mr-2 h-4 w-4" /> Adicionar</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}