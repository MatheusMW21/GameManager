'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gameService } from "@/services/api";
import { Search, Plus, Loader2, Gamepad2, ArrowLeft, Ghost, Telescope } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce"; 

interface IgdbGame {
    id: number;
    name: string;
    first_release_date?: number;
    cover?: {
        id: number;
        url: string;
    };
}

export default function DiscoveryPage() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500); 

    const [results, setResults] = useState<IgdbGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);
    
    const performSearch = useCallback(async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const data = await gameService.searchGames(searchTerm);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debouncedQuery) {
            performSearch(debouncedQuery);
        } else {
            setResults([]);
            setHasSearched(false);
        }
    }, [debouncedQuery, performSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    const getCoverUrl = (url?: string) => {
        if (!url) return null;
        let finalUrl = url;
        if (finalUrl.startsWith("//")) {
            finalUrl = "https:" + finalUrl;
        }
        return finalUrl.replace("t_thumb", "t_cover_big");
    };

    const handleAddToBacklog = async (game: IgdbGame) => {
        setAddingId(game.id);
        try {
            const coverUrl = game.cover?.url ? getCoverUrl(game.cover.url) || "" : "";
            
            let times = { main: 0, extra: 0, completionist: 0 };
            try {
                const timeData = await gameService.findHltbTimes(game.name);
                if (timeData) {
                    times = {
                        main: timeData.mainStory || 0,
                        extra: timeData.mainExtra || 0,
                        completionist: timeData.completionist || 0
                    };
                }
            } catch (err) {
                console.log("Sem dados de tempo.");
            }

            await gameService.create({
                title: game.name,
                platform: "TBD",
                status: 0, 
                coverUrl: coverUrl,
                steamAppId: "",
                timeMain: times.main,
                timeExtra: times.extra,
                timeCompletionist: times.completionist,
                comments: game.first_release_date 
                    ? `Lançado em: ${new Date(game.first_release_date * 1000).getFullYear()}` 
                    : ""
            });

            toast.success(`${game.name} adicionado à coleção!`);
        } catch (error) {
            toast.error("Erro ao adicionar jogo.");
        } finally {
            setAddingId(null);
        }
    };

    const getYear = (timestamp?: number) => {
        if (!timestamp) return "";
        return new Date(timestamp * 1000).getFullYear();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[80vh]">
                
                <div className="w-full flex items-center justify-between mb-8 max-w-6xl">
                    <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={20} /> Voltar ao Painel
                    </Link>
                </div>

                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                        Encontre seu próximo jogo
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Digite para buscar instantaneamente na base global.
                    </p>
                </div>

                <form onSubmit={handleManualSubmit} className="w-full max-w-2xl relative mb-12">
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? "text-purple-500" : "text-slate-500"}`} />
                        <Input 
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Comece a digitar (ex: Elden Ring)..." 
                            className="h-16 pl-12 pr-12 text-lg bg-slate-900/80 border-slate-700 rounded-2xl focus-visible:ring-purple-500 shadow-2xl shadow-purple-900/10 placeholder:text-slate-600 transition-all focus:bg-slate-900"
                            autoFocus
                        />
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-purple-500" size={20} />
                            </div>
                        )}
                    </div>
                </form>

                {/* --- RESULTADOS --- */}
                
                {isLoading && results.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[3/4] w-full rounded-xl bg-slate-800/50" />
                                <Skeleton className="h-4 w-3/4 bg-slate-800/50" />
                            </div>
                        ))}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {results.map((game) => {
                            const coverUrl = getCoverUrl(game.cover?.url);

                            return (
                                <div key={game.id} className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all flex flex-col">
                                    
                                    <Link href={`/discovery/${game.id}`} className="block relative cursor-pointer">
                                        <div className="aspect-[3/4] relative bg-slate-950 overflow-hidden">
                                            {coverUrl ? (
                                                <img 
                                                    src={coverUrl} 
                                                    alt={game.name} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2">
                                                    <Gamepad2 size={40} />
                                                    <span className="text-xs uppercase font-bold">Sem Capa</span>
                                                </div>
                                            )}
                                            
                                            {game.first_release_date && (
                                                <span className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-800 backdrop-blur-sm z-10">
                                                    {getYear(game.first_release_date)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="p-4 flex flex-col flex-1 gap-3">
                                        <Link href={`/discovery/${game.id}`} className="hover:text-purple-400 transition-colors">
                                            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2" title={game.name}>
                                                {game.name}
                                            </h3>
                                        </Link>
                                        
                                        <div className="mt-auto pt-2">
                                            <Button 
                                                onClick={(e) => {
                                                    e.preventDefault(); 
                                                    e.stopPropagation();
                                                    handleAddToBacklog(game);
                                                }}
                                                disabled={addingId === game.id}
                                                className="w-full bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white font-semibold transition-colors h-9 text-xs"
                                            >
                                                {addingId === game.id ? (
                                                    <Loader2 size={14} className="animate-spin mr-2" />
                                                ) : (
                                                    <Plus size={14} className="mr-2" />
                                                )}
                                                {addingId === game.id ? "Salvando..." : "Adicionar"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && query.trim() !== "" && (
                    <div className="text-center text-slate-500 mt-12 animate-in zoom-in-95 duration-300">
                        <Ghost size={64} className="mx-auto mb-4 opacity-20 text-slate-400" />
                        <h3 className="text-lg font-medium text-slate-300">Nada encontrado</h3>
                        <p className="text-sm">Não encontramos jogos com o nome "{query}".</p>
                    </div>
                )}

                {!hasSearched && !query && (
                    <div className="text-center mt-12 opacity-40 animate-pulse">
                        <Telescope size={64} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-500">Comece a digitar para explorar...</p>
                    </div>
                )}

            </main>
        </div>
    );
}