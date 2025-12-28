'use client';

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Tag, ArrowRight } from "lucide-react";

const TRENDING_GAMES = [
  { id: 1, title: "Elden Ring", rating: 4.8, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg" },
  { id: 2, title: "Baldur's Gate 3", rating: 4.9, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg" },
  { id: 3, title: "Metaphor: ReFantazio", rating: 4.7, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co88dd.jpg" },
  { id: 4, title: "Zelda: TOTK", rating: 4.9, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg" },
  { id: 5, title: "Silent Hill 2", rating: 4.8, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8nc2.jpg" },
  { id: 6, title: "Black Myth: Wukong", rating: 4.5, image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co84zh.jpg" },
];

const FRIENDS_ACTIVITY = [
    { user: "Diogo", action: "platinou", game: "Hollow Knight", time: "2h atrás", icon: "🏆" },
    { user: "Bianca", action: "comprou", game: "Stardew Valley", time: "5h atrás", icon: "💸" },
    { user: "Maurilio", action: "dropou", game: "Starfield", time: "1d atrás", icon: "💀" },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth(); 

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      
      <Navbar />

      <main>
        {!isAuthenticated ? (
            <div className="relative border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950">
                <div className="container mx-auto px-4 py-28 relative z-10 flex flex-col items-center text-center">
                    
                    <Badge variant="outline" className="mb-6 border-purple-500/50 text-purple-400 px-4 py-1 rounded-full uppercase tracking-wider text-xs font-bold bg-purple-500/10">
                        Versão Beta Disponível
                    </Badge>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white max-w-4xl">
                        Pare de acumular.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Comece a zerar.</span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                        O GameManager organiza sua biblioteca, monitora preços da Steam e calcula quanto tempo falta para zerar seus jogos usando dados do HLTB.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <RegisterDialog>
                            <Button className="h-12 px-8 text-lg bg-white text-slate-950 hover:bg-slate-200 font-bold rounded shadow-lg transition-transform hover:scale-105">
                                Criar meu Backlog
                            </Button>
                        </RegisterDialog>
                        
                        <Button variant="outline" className="h-12 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded">
                            Ver Funcionalidades
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-sm text-slate-500 font-medium">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="text-purple-500" size={24} />
                            <span>Integração HowLongToBeat</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Tag className="text-green-500" size={24} />
                            <span>Monitor de Preços Steam</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Star className="text-yellow-500" size={24} />
                            <span>Reviews & Wishlists</span>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Olá, {user || "Gamer"}! </h2>
                        <p className="text-slate-400">
                            Pronto para diminuir o backlog hoje?
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 font-bold">
                                Acessar Meu Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )}

        <div className="container mx-auto px-4 py-12 space-y-16">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3">
                    <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Em Alta no Backlog da Comunidade</h3>
                        <Link href="#" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {TRENDING_GAMES.map((game) => (
                            <div key={game.id} className="group relative cursor-pointer">
                                <div className="aspect-[2/3] overflow-hidden rounded bg-slate-800 border border-slate-800 shadow-lg relative">
                                    <img 
                                        src={game.image} 
                                        alt={game.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-50"
                                    />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                        <span className="text-xs font-bold text-white mb-2">{game.title}</span>
                                        <Button size="sm" variant="secondary" className="h-6 text-[10px] px-2">
                                            + Backlog
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                     <div className="mb-6 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            {isAuthenticated ? "Atividade Recente" : "Destaques"}
                        </h3>
                    </div>

                    <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 space-y-4">
                        {FRIENDS_ACTIVITY.map((activity, i) => (
                            <div key={i} className="flex gap-3 items-start pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-300 leading-snug">
                                        <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="text-purple-400">{activity.game}</span>
                                    </p>
                                    <span className="text-xs text-slate-600 block mt-1">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                        
                        {!isAuthenticated && (
                            <div className="pt-2">
                                <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                                    Ver Wishlists Públicas
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>

        <footer className="border-t border-slate-900 mt-20 bg-slate-950 py-12">
            <div className="container mx-auto px-4 text-center">
                <p className="text-slate-600 text-sm">
                    © 2025 GameManager. Seu backlog sob controle.
                </p>
            </div>
        </footer>
      </main>
    </div>
  );
}