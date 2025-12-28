'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { gameService } from "@/services/api";
import { BacklogGame } from "@/types/game";
import { 
    ArrowRight, 
    Flame, 
    Gamepad2, 
    LayoutDashboard, 
    PlayCircle, 
    Eye, 
    Star, 
    List, 
    BarChart3 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface IgdbGame {
    id: number;
    name: string;
    cover?: { url: string };
}

export default function LandingPage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    
    // Dados
    const [popularGames, setPopularGames] = useState<IgdbGame[]>([]);
    const [myPlayingGames, setMyPlayingGames] = useState<BacklogGame[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("gameboxd_token");
        const user = localStorage.getItem("gameboxd_user");
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                if (userData && userData.name) {
                    setUserName(userData.name);
                    setIsLoggedIn(true);
                    fetchUserData();
                }
            } catch (error) {
                localStorage.clear();
                setIsLoggedIn(false);
            }
        } else {
            if (!token) setLoading(false);
        }

        fetchPublicData();
    }, []);

    const fetchPublicData = async () => {
        try {
            const popular = await gameService.getPopularGames();
            setPopularGames(popular || []);
        } catch (error) {
            console.error("Erro ao buscar populares", error);
        } finally {
            if (!localStorage.getItem("gameboxd_token")) setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const allGames = await gameService.getAll();
            const playing = allGames.filter(g => g.status === 1).slice(0, 4);
            setMyPlayingGames(playing);
        } catch (error) {
            console.error("Erro user data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 pb-20">
            {/* Navbar */}
            {isLoggedIn ? (
                <Navbar />
            ) : (
                <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="text-purple-500" size={24} />
                            <span className="font-bold text-xl tracking-tight">GameManager</span>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">Entrar</Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-purple-600 hover:bg-purple-700 font-bold">Criar Conta</Button>
                            </Link>
                        </div>
                    </div>
                </header>
            )}

            <main className="container mx-auto px-4 py-12 space-y-20">
                
                {/* --- HERO SECTION (Identidade Original) --- */}
                <section className="text-center space-y-6 max-w-4xl mx-auto mt-8">
                    {isLoggedIn ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-300 bg-purple-900/10 px-3 py-1">
                                Bem-vindo de volta
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{userName}</span>!
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl">
                                Seu backlog está esperando. O que vamos jogar hoje?
                            </p>
                            <div className="flex justify-center gap-4 mt-8">
                                <Link href="/dashboard">
                                    <Button size="lg" className="h-12 px-8 bg-purple-600 hover:bg-purple-700 font-bold shadow-lg shadow-purple-900/20">
                                        <LayoutDashboard className="mr-2 h-5 w-5" /> Ir para Painel
                                    </Button>
                                </Link>
                                <Link href="/discovery">
                                    <Button size="lg" variant="outline" className="h-12 px-8 border-slate-700 hover:bg-slate-800 text-slate-200">
                                        Explorar Jogos
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                                Organize sua <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Vida Gamer</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                Pare de esquecer em qual fase você parou. Organize seu backlog, 
                                descubra novos jogos e acompanhe seu progresso em um só lugar.
                            </p>
                            <div className="mt-10">
                                <Link href="/auth/register">
                                    <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-full transition-transform hover:scale-105">
                                        Começar Agora <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* --- SEÇÃO: EM ALTA --- */}
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                            <Flame className="text-orange-500" size={20} />
                            <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Em Alta na Comunidade</h2>
                        </div>
                        <Link href="/discovery" className="text-xs text-slate-500 hover:text-white transition-colors">Ver mais</Link>
                    </div>

                    {loading && popularGames.length === 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="aspect-[2/3] rounded bg-slate-900" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                            {popularGames.map((game) => (
                                <Link href={`/discovery/${game.id}`} key={game.id} className="group relative">
                                    <div className="aspect-[2/3] rounded overflow-hidden border border-transparent group-hover:border-purple-500/50 bg-slate-900 relative transition-all shadow-lg group-hover:shadow-purple-900/20">
                                        {game.cover?.url ? (
                                            <img src={game.cover.url} alt={game.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800"><Gamepad2 className="text-slate-600"/></div>
                                        )}
                                        
                                        {/* Overlay Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="text-white drop-shadow-md" size={32} />
                                        </div>
                                    </div>
                                    {/* Tooltip simples */}
                                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 right-0 text-center z-10 pointer-events-none">
                                        <span className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                                            {game.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {isLoggedIn && myPlayingGames.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                            <PlayCircle className="text-blue-500" size={20} />
                            <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Continuar Jogando</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {myPlayingGames.map((game) => (
                                <div key={game.id} className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center gap-4">
                                    <div className="w-12 h-16 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                        {game.coverUrl && <img src={game.coverUrl} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white truncate text-sm">{game.title}</h3>
                                        <p className="text-xs text-blue-400 mt-1">Status: Jogando</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {!isLoggedIn && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="mb-6 border-b border-slate-800 pb-2">
                            <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">O que você pode fazer?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Feature 1 */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 hover:border-purple-500/30 transition-all flex items-start gap-4 group">
                                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-purple-900/30 group-hover:text-purple-400 transition-colors">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Rastreie seu Backlog</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Mantenha um registro de todos os jogos que você já zerou ou abandonou.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 hover:border-blue-500/30 transition-all flex items-start gap-4 group">
                                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                                    <List size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Crie sua Wishlist</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Salve jogos que você quer jogar no futuro e organize prioridades.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 hover:border-yellow-500/30 transition-all flex items-start gap-4 group">
                                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-yellow-900/30 group-hover:text-yellow-400 transition-colors">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Avalie e Comente</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Dê notas de 0 a 10 e escreva reviews pessoais sobre sua experiência.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 hover:border-emerald-500/30 transition-all flex items-start gap-4 group">
                                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-emerald-900/30 group-hover:text-emerald-400 transition-colors">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Estatísticas de Jogo</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Saiba quanto tempo leva para zerar ou platinar seus jogos (HLTB).
                                    </p>
                                </div>
                            </div>
                            
                            {/* Card Final */}
                            <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 p-6 rounded-xl border border-purple-500/20 flex flex-col justify-center items-center text-center col-span-1 md:col-span-2 lg:col-span-2">
                                <h3 className="font-bold text-white mb-2">Pronto para organizar?</h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    Junte-se à comunidade e tenha controle total da sua biblioteca.
                                </p>
                                <Link href="/auth/register">
                                    <Button className="bg-white text-slate-950 hover:bg-slate-200 font-bold">
                                        Criar Conta Gratuita
                                    </Button>
                                </Link>
                            </div>

                        </div>
                    </section>
                )}

                {/* --- FOOTER --- */}
                <footer className="pt-12 border-t border-slate-900 text-center text-slate-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} GameManager.</p>
                </footer>

            </main>
        </div>
    );
}