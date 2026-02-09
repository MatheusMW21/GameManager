'use client';

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { gameService } from "@/services/api";
import { BacklogGame } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { GameDetailsDialog } from "@/components/GameDetailsDialog";
import { Card } from "@/components/ui/card";
import { Gamepad2, Loader2, Star } from "lucide-react";

export default function WishlistPage() {
    const { isLoaded, isSignedIn } = useUser();
    const [games, setGames] = useState<BacklogGame[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await gameService.getAll();
                setGames(data || []);
            } finally {
                setLoading(false);
            }
        };
        if (isLoaded && isSignedIn) load();
    }, [isLoaded, isSignedIn]);

    const wishlist = useMemo(() => games.filter(g => g.status === 0), [games]);

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
            <main className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Wishlist</h1>
                        <p className="text-slate-400 text-sm">Jogos que você quer jogar.</p>
                    </div>
                    <div className="text-xs text-slate-500">{wishlist.length} jogos</div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-slate-500 text-center py-20 border border-dashed border-slate-800 rounded-xl">
                        Sua wishlist está vazia.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {wishlist.map(game => (
                            <Card key={game.id} className="bg-slate-900 border-slate-800 overflow-hidden group flex flex-col h-full hover:border-purple-500/50 transition-all shadow-md">
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
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col gap-2">
                                            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors" title={game.title}>
                                                {game.title}
                                            </h3>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                <Star size={12} className="text-slate-600" /> Reviews no detalhe
                                            </div>
                                        </div>
                                    </div>
                                </GameDetailsDialog>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
