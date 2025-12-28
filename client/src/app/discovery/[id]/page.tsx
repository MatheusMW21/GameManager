'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { gameService } from "@/services/api";
import { ArrowLeft, Calendar, Gamepad2, Layers, Plus, Star, Users, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const CATEGORY_MAP: Record<number, string> = {
    0: "Jogo Base",
    1: "DLC / Add-on",
    2: "Expansão",
    3: "Bundle",
    4: "Expansão Standalone",
    8: "Remake",
    9: "Remaster",
    10: "Port",
    11: "Season Pass"
};

interface GameDetails {
    id: number;
    name: string;
    summary: string;
    firstReleaseDate?: number;
    cover?: { url: string };
    category: number;
    aggregatedRating?: number;
    genres?: { name: string }[];
    platforms?: { name: string }[]; 
    screenshots?: { url: string }[];
    involvedCompanies?: { company: { name: string }, developer: boolean, publisher: boolean }[];
}

export default function GameDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [game, setGame] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await gameService.getGameDetails(params.id as string);
                setGame(data);
            } catch (error) {
                toast.error("Erro ao carregar detalhes do jogo.");
                router.push("/discovery");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchDetails();
    }, [params.id, router]);

    const handleAddToBacklog = async () => {
        if (!game) return;
        setIsSaving(true);
        try {
            let times = { main: 0, extra: 0, completionist: 0 };
            try {
                const timeData = await gameService.findHltbTimes(game.name);
                if (timeData) {
                    times = { main: timeData.mainStory || 0, extra: timeData.mainExtra || 0, completionist: timeData.completionist || 0 };
                }
            } catch (e) { console.log("Sem tempos"); }

            await gameService.create({
                title: game.name,
                platform: "TBD", 
                status: 0,
                coverUrl: game.cover?.url || "",
                steamAppId: "",
                timeMain: times.main,
                timeExtra: times.extra,
                timeCompletionist: times.completionist,
                comments: game.firstReleaseDate ? `Lançado em: ${new Date(game.firstReleaseDate * 1000).getFullYear()}` : ""
            });

            toast.success("Adicionado à coleção!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <DetailsSkeleton />;
    if (!game) return null;

    const backdropUrl = game.screenshots && game.screenshots.length > 0 
        ? game.screenshots[0].url 
        : game.cover?.url;

    const developers = game.involvedCompanies?.filter(c => c.developer).map(c => c.company.name).join(", ");
    const categoryName = CATEGORY_MAP[game.category] || "Jogo";
    const year = game.firstReleaseDate ? new Date(game.firstReleaseDate * 1000).getFullYear() : "TBD";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
            <Navbar />

            <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-105"
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                
                <div className="absolute top-6 left-4 md:left-8 z-20">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-300 hover:text-white hover:bg-slate-900/50">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Voltar
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 max-w-6xl">
                
                <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-72 space-y-4">
                    <div className="rounded-lg border-4 border-slate-900 shadow-2xl overflow-hidden aspect-[3/4] bg-slate-900 relative group">
                        {game.cover?.url ? (
                            <>
                                <img src={game.cover.url} alt={game.name} className="w-full h-full object-cover" />
                                <div 
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => setSelectedImage(game.cover?.url || "")}
                                >
                                    <ZoomIn className="text-white w-10 h-10" />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full"><Gamepad2 size={48} className="text-slate-700"/></div>
                        )}
                    </div>

                    <Button 
                        onClick={handleAddToBacklog} 
                        disabled={isSaving}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 text-lg shadow-lg shadow-purple-900/20"
                    >
                        {isSaving ? "Salvando..." : <><Plus className="mr-2" /> Adicionar à Lista</>}
                    </Button>
                </div>

                {/* Informações */}
                <div className="flex-1 space-y-6 text-center md:text-left pt-4">
                    
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg mb-2">
                            {game.name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm md:text-base text-slate-300 font-medium">
                            <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-900/50">
                                {year}
                            </Badge>
                            
                            <Badge className={`${game.category === 0 ? "bg-blue-600" : "bg-orange-600"} hover:bg-opacity-80`}>
                                {categoryName}
                            </Badge>

                            {developers && (
                                <span className="flex items-center gap-1">
                                    <Users size={14} className="text-purple-400" /> {developers}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
                        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3">Sinopse</h3>
                        <p className="text-slate-300 leading-relaxed text-lg">
                            {game.summary || "Nenhuma descrição disponível."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        
                        <div className="space-y-2">
                            <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Gêneros
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {game.genres?.map(g => (
                                    <Badge key={g.name} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                        {g.name}
                                    </Badge>
                                )) || "--"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Gamepad2 size={14} /> Plataformas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {game.platforms?.map(p => (
                                    <Badge key={p.name} variant="outline" className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-500">
                                        {p.name}
                                    </Badge>
                                )) || "TBD"}
                            </div>
                        </div>

                        {game.aggregatedRating && (
                            <div className="space-y-1">
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Star size={14} /> Nota da Crítica
                                </h4>
                                <div className="text-2xl font-bold text-yellow-500">
                                    {Math.round(game.aggregatedRating)}<span className="text-sm text-slate-600">/100</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {game.screenshots && game.screenshots.length > 0 && (
                        <div className="pt-6">
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4 text-left">Galeria</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {game.screenshots.slice(0, 5).map((shot, i) => (
                                    <div 
                                        key={i} 
                                        className="relative group cursor-pointer flex-shrink-0"
                                        onClick={() => setSelectedImage(shot.url)}
                                    >
                                        <img 
                                            src={shot.url.replace("t_1080p", "t_screenshot_med")} 
                                            alt="Screenshot" 
                                            className="h-32 rounded-lg border border-slate-800 hover:border-purple-500 transition-all"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <ZoomIn className="text-white w-6 h-6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-purple-400 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={selectedImage.replace("t_cover_big", "t_1080p").replace("t_screenshot_med", "t_1080p")} 
                        alt="Zoom" 
                        className="max-w-full max-h-[90vh] rounded shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
}

function DetailsSkeleton() {
    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Navbar />
            <Skeleton className="w-full h-[50vh] bg-slate-900" />
            <div className="container mx-auto px-4 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
                <Skeleton className="w-48 h-72 rounded-lg bg-slate-800 mx-auto md:mx-0" />
                <div className="flex-1 space-y-4 pt-12">
                    <Skeleton className="h-12 w-3/4 bg-slate-800" />
                    <Skeleton className="h-32 w-full bg-slate-800 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}