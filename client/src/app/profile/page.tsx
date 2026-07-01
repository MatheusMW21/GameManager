"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { gameService } from "@/services/api";
import { UserProfile } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Gamepad2, Plus, Loader2, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";

interface IgdbGame {
  id: number;
  name: string;
  cover?: { id: number; url: string };
}

const getCoverUrl = (url?: string) => {
  if (!url) return null;
  const finalUrl = url.startsWith("//") ? "https:" + url : url;
  return finalUrl.replace("t_thumb", "t_cover_big");
};

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const queryClient = useQueryClient();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => gameService.getProfile(),
    enabled: isLoaded && !!isSignedIn,
  });

  const { data: searchResults = [], isLoading: searching } = useQuery<IgdbGame[]>({
    queryKey: ["igdb-search", debouncedSearch],
    queryFn: () => gameService.searchGames(debouncedSearch),
    enabled: debouncedSearch.trim().length > 1,
  });

  const favMutation = useMutation({
    mutationFn: ({ slot, game }: { slot: number; game: IgdbGame }) =>
      gameService.updateFavoriteSlot(slot, {
        igdbGameId: game.id,
        title: game.name,
        coverUrl: getCoverUrl(game.cover?.url) ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setPickerSlot(null);
      setSearch("");
      toast.success("Favorito atualizado");
    },
    onError: () => toast.error("Erro ao atualizar favorito"),
  });

  const favSlots = [profile?.fav1, profile?.fav2, profile?.fav3, profile?.fav4];

  if (!isLoaded) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-10">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold text-white">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Jogos Favoritos
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-slate-900" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {favSlots.map((fav, i) => (
                <button
                  key={i}
                  onClick={() => setPickerSlot(i + 1)}
                  className="aspect-[2/3] rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 bg-slate-900 transition-all group relative"
                >
                  {fav?.coverUrl ? (
                    <>
                      <img
                        src={fav.coverUrl}
                        alt={fav.title ?? ""}
                        className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="text-white drop-shadow-md" size={28} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600 group-hover:text-purple-400 transition-colors">
                      <Plus size={24} />
                      <span className="text-xs">Slot {i + 1}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog
        open={pickerSlot !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPickerSlot(null);
            setSearch("");
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-[520px]">
          <DialogTitle>Escolher favorito — Slot {pickerSlot}</DialogTitle>

          <div className="relative mt-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jogo..."
              className="pl-9 bg-slate-950 border-slate-700"
              autoFocus
            />
          </div>

          <div className="mt-3 min-h-[200px]">
            {searching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-purple-500" size={24} />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {searchResults.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => favMutation.mutate({ slot: pickerSlot!, game })}
                    disabled={favMutation.isPending}
                    className="group relative aspect-[2/3] rounded overflow-hidden bg-slate-800 border border-transparent hover:border-purple-500 transition-all"
                  >
                    {game.cover?.url ? (
                      <img
                        src={getCoverUrl(game.cover.url) ?? ""}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 size={20} className="text-slate-600" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {game.name}
                    </div>
                  </button>
                ))}
              </div>
            ) : debouncedSearch.trim().length > 1 ? (
              <p className="text-slate-500 text-center py-10 text-sm">
                Nenhum resultado.
              </p>
            ) : (
              <p className="text-slate-600 text-center py-10 text-sm">
                Digite para buscar um jogo.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
