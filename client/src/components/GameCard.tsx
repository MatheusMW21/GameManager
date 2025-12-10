'use client'; 
import { useState } from 'react';
import { Game } from "../types/game";
import { gameService } from '../services/api';

interface GameCardProps {
    game: Game;
}

export function GameCard({ game }: GameCardProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async () => {
        setIsSaving(true);
        try {
            await gameService.addToBacklog({
                title: game.name,
                coverUrl: game.cover?.url,
                externalId: game.id.toString(),
                platform: "TBD", 
                status: 0 
            });
            alert(`${game.name} salvo no backlog!`);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar jogo.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 flex flex-col">
            <div className="relative h-64 bg-slate-900 overflow-hidden group">
                {game.cover ? (
                    <img 
                        src={game.cover.url} 
                        alt={game.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        Sem Imagem
                    </div>
                )}
                
                {/* Botão Flutuante (Overlay) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        onClick={handleAdd}
                        disabled={isSaving}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transform hover:scale-105 transition"
                    >
                        {isSaving ? 'Salvando...' : '+ Adicionar'}
                    </button>
                </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 mb-1">
                        {game.name}
                    </h3>
                    {game.releaseDate && (
                        <p className="text-xs text-purple-400 font-medium mb-2">
                            {new Date(game.releaseDate).getFullYear()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}