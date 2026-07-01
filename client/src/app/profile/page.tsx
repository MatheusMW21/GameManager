"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { gameService } from "@/services/api";
import { FavoriteGame, Review, UserProfile } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Gamepad2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

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

function SortableSlot({
  id,
  fav,
  onPick,
}: {
  id: number;
  fav: FavoriteGame | null;
  onPick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onPick}
      className={`aspect-[2/3] rounded-lg overflow-hidden border bg-slate-800 transition-colors cursor-grab active:cursor-grabbing relative group ${
        isDragging
          ? "opacity-40 border-purple-500"
          : "border-slate-700 hover:border-purple-500"
      }`}
    >
      {fav?.coverUrl ? (
        <>
          <img
            src={fav.coverUrl}
            alt={fav.title ?? ""}
            className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="text-white drop-shadow-md" size={20} />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-600 group-hover:text-purple-400 transition-colors">
          <Plus size={20} />
          <span className="text-[10px]">Slot {id + 1}</span>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [localSlots, setLocalSlots] = useState<(FavoriteGame | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: profile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => gameService.getProfile(),
    enabled: isLoaded && !!isSignedIn,
  });

  const { data: recentEntries = [], isLoading: loadingDiary } = useQuery<
    Review[]
  >({
    queryKey: ["diary-recent"],
    queryFn: () => gameService.getDiary(4),
    enabled: isLoaded && !!isSignedIn,
  });

  const { data: searchResults = [], isLoading: searching } = useQuery<
    IgdbGame[]
  >({
    queryKey: ["igdb-search", debouncedSearch],
    queryFn: () => gameService.searchGames(debouncedSearch),
    enabled: debouncedSearch.trim().length > 1,
  });

  useEffect(() => {
    if (editOpen) {
      setLocalSlots([
        profile?.fav1 ?? null,
        profile?.fav2 ?? null,
        profile?.fav3 ?? null,
        profile?.fav4 ?? null,
      ]);
    }
  }, [editOpen]);

  const saveAllMutation = useMutation({
    mutationFn: () => gameService.updateAllFavorites(localSlots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      closeEdit();
      toast.success("Perfil atualizado");
    },
    onError: () => toast.error("Erro ao salvar perfil"),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setLocalSlots((prev) =>
      arrayMove(prev, active.id as number, over.id as number)
    );
  };

  const handlePickGame = (game: IgdbGame) => {
    if (pickerSlot === null) return;
    const updated = [...localSlots];
    updated[pickerSlot - 1] = {
      igdbGameId: game.id,
      title: game.name,
      coverUrl: getCoverUrl(game.cover?.url) ?? null,
    };
    setLocalSlots(updated);
    setPickerSlot(null);
    setSearch("");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      await user.setProfileImage({ file });
      toast.success("Foto atualizada");
    } catch {
      toast.error("Erro ao atualizar foto");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const favSlots = [profile?.fav1, profile?.fav2, profile?.fav3, profile?.fav4];

  const closeEdit = () => {
    setEditOpen(false);
    setPickerSlot(null);
    setSearch("");
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-12">
        {/* Header */}
        <div className="flex items-center gap-6">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.firstName ?? ""}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700">
              <Gamepad2 size={32} className="text-slate-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-800 gap-1.5 h-7 text-xs"
            >
              <Pencil size={12} />
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Favorite Games */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Jogos Favoritos
          </h2>
          {loadingProfile ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-slate-900"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {favSlots.map((fav, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg overflow-hidden border border-slate-800 bg-slate-900"
                >
                  {fav?.coverUrl ? (
                    <img
                      src={fav.coverUrl}
                      alt={fav.title ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 size={24} className="text-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Atividade Recente
            </h2>
            <Link
              href="/diary"
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Ver tudo
            </Link>
          </div>
          {loadingDiary ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-slate-900"
                />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <p className="text-slate-600 text-sm py-6 text-center border border-dashed border-slate-800 rounded-xl">
              Nenhuma review ainda.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {recentEntries.map((entry) => (
                <div key={entry.id}>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                    {entry.gameCoverUrl ? (
                      <img
                        src={entry.gameCoverUrl}
                        alt={entry.gameTitle ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 size={24} className="text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={
                          Math.round(entry.rating) >= s
                            ? "fill-cyan-300 text-cyan-300"
                            : "text-slate-700"
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-[520px] p-0 overflow-hidden">
          {pickerSlot === null ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-4 p-6 pb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="relative group flex-shrink-0"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                      <Gamepad2 size={24} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 size={18} className="animate-spin text-white" />
                    ) : (
                      <Camera size={18} className="text-white" />
                    )}
                  </div>
                </button>
                <div>
                  <DialogTitle className="text-base font-bold">
                    {user?.firstName} {user?.lastName}
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clique na foto para alterar
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="px-6 pb-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                  Jogos Favoritos
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={[0, 1, 2, 3]}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="grid grid-cols-4 gap-3">
                      {localSlots.map((fav, i) => (
                        <SortableSlot
                          key={i}
                          id={i}
                          fav={fav}
                          onPick={() => setPickerSlot(i + 1)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <p className="text-[11px] text-slate-600 mt-2">
                  Arraste para reordenar · Clique para trocar
                </p>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
                <Button
                  variant="ghost"
                  onClick={closeEdit}
                  className="text-slate-400"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveAllMutation.mutate()}
                  disabled={saveAllMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saveAllMutation.isPending && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-6 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPickerSlot(null);
                    setSearch("");
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <DialogTitle>Game {pickerSlot}</DialogTitle>
              </div>

              <div className="relative">
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

              <div className="min-h-[200px]">
                {searching ? (
                  <div className="flex justify-center py-10">
                    <Loader2
                      className="animate-spin text-purple-500"
                      size={24}
                    />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
                    {searchResults.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handlePickGame(game)}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
