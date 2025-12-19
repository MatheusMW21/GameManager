'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gameService } from "@/services/api";
import { Search, Plus, Loader2, Gamepad2, ArrowLeft, Ghost } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
    const [results, setResults] = useState<IgdbGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);
    
    const router = useRouter();

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const data = await gameService.searchGames(query);
            setResults(data);
        } catch (error) {
            toast.error("Erro ao buscar jogos. Verifique sua conexão.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToBacklog = async (game: IgdbGame) => {
        setAddingId(game.id); 
        try {
            let coverUrl = "";
            if (game.cover?.url) {
                coverUrl = game.cover.url.startsWith("//") 
                    ? "https:" + game.cover.url 
                    : game.cover.url;
                coverUrl = coverUrl.replace("t_thumb", "t_cover_big");
            }

            await gameService.create({
                title: game.name,
                platform: "TBD", 
                status: 0, 
                coverUrl: coverUrl,
                steamAppId: "", 
                comments: game.first_release_date 
                    ? `Lançado em: ${new Date(game.first_release_date * 1000).getFullYear()}` 
                    : ""
            });

            toast.success(`${game.name} adicionado!`);
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
            
            <main className="container mx-auto px-4 py-8 flex flex-col items-center">
                
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
                        Pesquise na base de dados global e adicione à sua coleção.
                    </p>
                </div>

                {/* Barra de Busca Centralizada */}
                <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-16">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Digite o nome do jogo (ex: God of War)..." 
                        className="h-16 pl-12 text-lg bg-slate-900/80 border-slate-700 rounded-2xl focus-visible:ring-purple-500 shadow-2xl shadow-purple-900/10 placeholder:text-slate-600"
                        autoFocus
                    />
                    <Button 
                        type="submit" 
                        className="absolute right-3 top-3 h-10 px-6 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Buscar"}
                    </Button>
                </form>

                {/* Grid de Resultados */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {results.map((game) => (
                        <div key={game.id} className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all flex flex-col">
                            
                            {/* Imagem (Aspect Ratio de Capa) */}
                            <div className="aspect-[3/4] relative bg-slate-950 overflow-hidden">
                                {game.cover?.url ? (
                                    <img 
                                        src={"https:" + game.cover.url.replace("t_thumb", "t_cover_big")} 
                                        alt={game.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2">
                                        <Gamepad2 size={40} />
                                        <span className="text-xs uppercase font-bold">Sem Capa</span>
                                    </div>
                                )}
                                
                                {/* Badge de Ano */}
                                {game.first_release_date && (
                                    <span className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
                                        {getYear(game.first_release_date)}
                                    </span>
                                )}
                            </div>

                            {/* Conteúdo do Card */}
                            <div className="p-4 flex flex-col flex-1 gap-3">
                                <h3 className="font-bold text-white text-sm leading-tight line-clamp-2" title={game.name}>
                                    {game.name}
                                </h3>
                                
                                <div className="mt-auto pt-2">
                                    <Button 
                                        onClick={() => handleAddToBacklog(game)}
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
                    ))}
                </div>

                {/* Empty State */}
                {results.length === 0 && !isLoading && query && (
                    <div className="text-center text-slate-500 mt-12">
                        <Ghost size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Nenhum jogo encontrado para "{query}".</p>
                    </div>
                )}
            </main>
        </div>
    );
}