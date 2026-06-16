"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { gameService } from "@/services/api";
import { Review } from "@/types/game";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen,
  Gamepad2,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function DiaryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [editingEntry, setEditingEntry] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(4);
  const [editBody, setEditBody] = useState("");
  const [editPlayedAt, setEditPlayedAt] = useState("");
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);

  const resolveHalfStep = (
    event: React.MouseEvent<HTMLButtonElement>,
    star: number
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? star - 0.5 : star;
  };

  const renderStar = (value: number, index: number, size = 20) => {
    const position = index + 1;
    const full = value >= position;
    const half = !full && value >= position - 0.5;
    if (half) {
      return (
        <span
          className="relative inline-block"
          style={{ width: size, height: size }}
        >
          <Star
            size={size}
            className="absolute inset-0 text-slate-600"
            strokeWidth={1.8}
          />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: "50%" }}
          >
            <Star
              size={size}
              className="text-cyan-300 fill-cyan-300"
              strokeWidth={1.8}
            />
          </span>
        </span>
      );
    }
    return (
      <Star
        size={size}
        className={full ? "text-cyan-300 fill-cyan-300" : "text-slate-600"}
        strokeWidth={1.8}
      />
    );
  };

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["diary"],
    queryFn: () => gameService.getDiary(),
    enabled: isLoaded && !!isSignedIn,
  });

  const openEdit = (r: Review) => {
    setEditingEntry(r);
    setEditRating(r.rating);
    setEditBody(r.body ?? "");
    setEditPlayedAt(r.playedAt?.slice(0, 10) ?? "");
  };

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      gameId,
      data,
    }: {
      id: number;
      gameId: number;
      data: { rating: number; body?: string; playedAt: string | null };
    }) => gameService.updateReview(gameId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      setEditingEntry(null);
      toast.success("Review atualizada");
    },
    onError: () => toast.error("Erro ao atualizar review"),
  });

  const handleUpdate = () => {
    if (!editingEntry) return;
    updateMutation.mutate({
      id: editingEntry.id,
      gameId: editingEntry.gameBacklogItemId ?? 0,
      data: {
        rating: editRating,
        body: editBody.trim() || undefined,
        playedAt: editPlayedAt || null,
      },
    });
  };

  const deleteMutation = useMutation({
    mutationFn: ({ id, gameId }: { id: number; gameId: number }) =>
      gameService.deleteReview(gameId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      setEditingEntry(null);
      toast.success("Review deletada");
    },
    onError: () => toast.error("Erro ao deletar review"),
  });

  const handleDelete = async () => {
    if (!editingEntry) return;
    if (!confirm("Tem certeza de que deseja remover esta review?")) return;
    deleteMutation.mutate({
      gameId: editingEntry.gameBacklogItemId ?? 0,
      id: editingEntry.id,
    });
  };

  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; entries: Review[] }>();
    for (const entry of entries) {
      const date = new Date(entry.playedAt ?? entry.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      if (!groups.has(key)) groups.set(key, { label, entries: [] });
      groups.get(key)!.entries.push(entry);
    }
    return Array.from(groups.values());
  }, [entries]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen size={22} className="text-purple-400" /> Diário
            </h1>
            <p className="text-slate-400 text-sm">
              Suas reviews em ordem cronológica.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {entries.length} entradas
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-slate-500 text-center py-20 border border-dashed border-slate-800 rounded-xl">
            Nenhuma review ainda. Abra um jogo e escreva sua primeira entrada.
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.label}>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pb-2 border-b border-slate-800">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.entries.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl flex overflow-hidden"
                    >
                      <div className="w-14 flex-shrink-0 bg-slate-900">
                        {r.gameCoverUrl ? (
                          <img
                            src={r.gameCoverUrl}
                            alt={r.gameTitle ?? ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center min-h-[88px]">
                            <Gamepad2 size={18} className="text-slate-700" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-bold text-white text-sm leading-tight">
                            {r.gameTitle ?? "Jogo desconhecido"}
                          </span>
                          <button
                            onClick={() => openEdit(r)}
                            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-cyan-300 text-xs font-bold flex items-center gap-1">
                            <Star size={11} className="fill-cyan-300" />{" "}
                            {r.rating}/5
                          </span>
                          <span className="text-slate-500 text-xs">
                            {formatDate(r.playedAt ?? r.createdAt)}
                          </span>
                        </div>
                        {r.body && (
                          <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                            {r.body}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit modal */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEntry(null);
            setEditHoverRating(null);
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-[560px] p-0 overflow-hidden">
          <div className="flex gap-5 p-6">
            <div className="w-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 self-start">
              {editingEntry?.gameCoverUrl ? (
                <img
                  src={editingEntry.gameCoverUrl}
                  alt={editingEntry.gameTitle ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center">
                  <Gamepad2 size={28} className="text-slate-600" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  {editingEntry?.gameTitle ?? "Jogo desconhecido"}
                </DialogTitle>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Jogado em
                </label>
                <Input
                  type="date"
                  value={editPlayedAt}
                  onChange={(e) => setEditPlayedAt(e.target.value)}
                  className="bg-slate-950 border-slate-700 w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Review
                </label>
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="bg-slate-950 border-slate-700 min-h-[100px]"
                  placeholder="Sua opinião sobre o jogo..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Nota
                </label>
                <div
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1.5"
                  onMouseLeave={() => setEditHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <button
                      key={star}
                      type="button"
                      className="rounded-sm p-0.5 transition-transform hover:scale-110 focus:outline-none"
                      onMouseMove={(e) =>
                        setEditHoverRating(resolveHalfStep(e, star))
                      }
                      onClick={(e) => setEditRating(resolveHalfStep(e, star))}
                    >
                      {renderStar(editHoverRating ?? editRating, index)}
                    </button>
                  ))}
                  <span className="text-slate-400 text-sm ml-1">
                    {(editHoverRating ?? editRating).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || updateMutation.isPending}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Deletar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setEditingEntry(null)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || deleteMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending && (
                  <Loader2 size={14} className="animate-spin mr-1" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
