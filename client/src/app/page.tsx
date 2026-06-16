"use client";

import Link from "next/link";
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
  List,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

interface FeedGame {
  id: number;
  title: string;
  coverUrl?: string;
  platform?: string;
  igdbGameId: number;
}

interface FeedReview {
  reviewId: number;
  rating: number;
  body?: string;
  playedAt?: string | null;
  createdAt: string;
  gameId: number;
  gameTitle: string;
  gameCoverUrl?: string;
  userId: number;
  userName: string;
}

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  const { data: recentReviewedGames = [], isLoading: loadingGames } = useQuery({
    queryKey: ["feed-recent-games"],
    queryFn: () => gameService.getRecentReviewedGames(6),
  });

  const { data: feedReviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["feed-reviews"],
    queryFn: () => gameService.getFeedReviews(8),
  });

  const { data: myPlayingGames = [] } = useQuery<BacklogGame[]>({
    queryKey: ["my-playing-games"],
    queryFn: async () => {
      const allGames = await gameService.getAll();
      return allGames.filter((g: BacklogGame) => g.status === 1).slice(0, 4);
    },
    enabled: !!isSignedIn,
  });

  if (!isLoaded) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 pb-20">
      {isSignedIn ? (
        <Navbar />
      ) : (
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-purple-500" size={24} />
              <span className="font-bold text-xl tracking-tight">
                GameManager
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-purple-600 hover:bg-purple-700 font-bold">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-12 space-y-20">
        <section className="text-center space-y-6 max-w-4xl mx-auto mt-8">
          {isSignedIn ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge
                variant="outline"
                className="mb-4 border-purple-500/30 text-purple-300 bg-purple-900/10 px-3 py-1"
              >
                Bem-vindo de volta
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                Olá,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  {user?.firstName}
                </span>
                !
              </h1>
              <p className="text-slate-400 text-lg md:text-xl">
                Seu backlog está esperando. O que vamos jogar hoje?
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 font-bold shadow-lg shadow-purple-900/20"
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Ir para Painel
                  </Button>
                </Link>
                <Link href="/discovery">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    Explorar Jogos
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                Organize sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                  Vida Gamer
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Registre cada jogo que você jogou. Organize seu backlog, escreva
                reviews e mantenha um diário das suas partidas em um só lugar.
              </p>
              <div className="mt-10">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-full transition-transform hover:scale-105"
                  >
                    Começar Agora <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                Jogos do Momento
              </h2>
            </div>
            <Link
              href="/discovery"
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Ver mais
            </Link>
          </div>

          {loadingGames ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] rounded bg-slate-900"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {recentReviewedGames.map((game) => (
                <Link
                  href="/dashboard"
                  key={game.igdbGameId}
                  className="group relative"
                >
                  <div className="aspect-[2/3] rounded overflow-hidden border border-transparent group-hover:border-purple-500/50 bg-slate-900 relative transition-all shadow-lg group-hover:shadow-purple-900/20">
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Gamepad2 className="text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="text-white drop-shadow-md" size={32} />
                    </div>
                  </div>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-0 right-0 text-center z-10 pointer-events-none">
                    <span className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                      {game.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                Reviews da Comunidade
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Ver mais
            </Link>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded bg-slate-900" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedReviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4"
                >
                  <div className="w-16 h-24 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                    {review.gameCoverUrl ? (
                      <img
                        src={review.gameCoverUrl}
                        alt={review.gameTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="text-slate-600" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white truncate">
                        {review.gameTitle}
                      </div>
                      <div className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                        <Star size={12} /> {review.rating}/5
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      por {review.userName}
                    </div>
                    {review.body && (
                      <p className="text-sm text-slate-300 mt-2 line-clamp-3">
                        {review.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {isSignedIn && myPlayingGames.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <PlayCircle className="text-blue-500" size={20} />
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                Continuar Jogando
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myPlayingGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-slate-900 border border-slate-800 rounded p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-16 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                    {game.coverUrl && (
                      <img
                        src={game.coverUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white truncate text-sm">
                      {game.title}
                    </h3>
                    <p className="text-xs text-blue-400 mt-1">
                      Status: Jogando
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isSignedIn && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="mb-6 border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">
                O que você pode fazer?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all flex items-start gap-4 group">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-purple-900/30 group-hover:text-purple-400 transition-colors">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">
                    Rastreie seu Backlog
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Mantenha um registro de todos os jogos que você já zerou ou
                    abandonou.
                  </p>
                </div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all flex items-start gap-4 group">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                  <List size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">
                    Crie sua Wishlist
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Salve jogos que você quer jogar no futuro e organize
                    prioridades.
                  </p>
                </div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all flex items-start gap-4 group">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-yellow-900/30 group-hover:text-yellow-400 transition-colors">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">
                    Avalie e Comente
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Dê notas de 0 a 10 e escreva reviews pessoais sobre sua
                    experiência.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 p-6 rounded-xl border border-purple-500/20 flex flex-col justify-center items-center text-center col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="font-bold text-white mb-2">
                  Pronto para organizar?
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Junte-se à comunidade e tenha controle total da sua
                  biblioteca.
                </p>
                <Link href="/sign-up">
                  <Button className="bg-white text-slate-950 hover:bg-slate-200 font-bold">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <footer className="pt-12 border-t border-slate-900 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} GameManager.</p>
        </footer>
      </main>
    </div>
  );
}
