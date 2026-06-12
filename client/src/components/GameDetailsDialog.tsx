"use client";

import { useEffect, useMemo, useState } from "react";
import { BacklogGame, Review } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SteamPriceBadge } from "./SteamPriceBadge";
import { gameService } from "@/services/api";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Gamepad2,
  Star,
  Quote,
  AlertOctagon,
  ExternalLink,
  Clock,
  Trophy,
  BookOpen,
  History,
  Loader2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  0: {
    label: "Wishlist",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
  1: {
    label: "Jogando",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  2: {
    label: "Zerado",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  3: {
    label: "Dropado",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

const TimeCard = ({ icon: Icon, label, time, isGoal }: any) => (
  <div
    className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center gap-1 relative transition-all ${
      isGoal
        ? "bg-purple-900/20 border-purple-500/50 scale-105 shadow-lg shadow-purple-900/20 z-10"
        : "bg-slate-900/50 border-slate-800 opacity-60 grayscale hover:grayscale-0"
    }`}
  >
    {isGoal && (
      <div className="absolute -top-2 bg-purple-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
        Meta
      </div>
    )}
    <Icon size={16} className={isGoal ? "text-purple-400" : "text-slate-500"} />
    <span className="text-[10px] uppercase text-slate-400 font-semibold">
      {label}
    </span>
    <span className="text-lg font-bold text-white leading-none">
      {time || 0}h
    </span>
  </div>
);

interface GameDetailsDialogProps {
  game: BacklogGame;
  children: React.ReactNode;
}

export function GameDetailsDialog({ game, children }: GameDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rating, setRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [playedAt, setPlayedAt] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(4);
  const [editBody, setEditBody] = useState<string>("");
  const [editPlayedAt, setEditPlayedAt] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);

  const timeMain = game.timeMain || 0;
  const timeExtra = game.timeExtra || 0;
  const timeCompletionist = game.timeCompletionist || 0;
  const playedTime = game.timePlayed || 0;

  const getTargetTime = () => {
    if (game.myGoal === 0) return timeMain;
    if (game.myGoal === 2) return timeCompletionist;
    return timeExtra;
  };

  const targetTime = getTargetTime() || 1;
  const progressPercent = Math.min(
    100,
    Math.round((playedTime / targetTime) * 100)
  );

  const statusInfo =
    STATUS_CONFIG[game.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG[0];

  const interactiveRating = hoverRating ?? rating;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoadingReviews(true);
      try {
        const data = await gameService.getReviews(game.id);
        setReviews(data || []);
      } catch {
        toast.error("Erro ao carregar reviews.");
      } finally {
        setLoadingReviews(false);
      }
    };
    load();
  }, [open, game.id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5 || rating % 0.5 !== 0) return;
    setCreating(true);
    try {
      const created = await gameService.createReview(game.id, {
        rating,
        body: body.trim() ? body.trim() : undefined,
        playedAt: playedAt ? playedAt : null,
        igdbGameId: game.externalId ? parseInt(game.externalId, 10) : undefined,
        gameTitle: game.title,
        gameCoverUrl: game.coverUrl,
      });
      setReviews((prev) => [created, ...prev]);
      setBody("");
      setPlayedAt("");
      setRating(4);
      toast.success("Review salva.");
    } catch {
      toast.error("Erro ao salvar review.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateReview = async () => {
    setUpdating(true);
    try {
      await gameService.updateReview(game.id, editingId!, {
        rating: editRating,
        body: editBody.trim() || undefined,
        playedAt: editPlayedAt || null,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                rating: editRating,
                body: editBody,
                playedAt: editPlayedAt || null,
              }
            : r
        )
      );
      setEditingId(null);
      toast.success("Review atualizada.");
    } catch {
      toast.error("Erro ao atualizar a review.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Tem certeza de que deseja remover esta review?")) return;
    setDeleting(true);
    setDeletingId(id);
    try {
      await gameService.deleteReview(game.id, id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deletada.");
    } catch {
      toast.error("Erro ao deletar a review.");
    } finally {
      setDeleting(false);
    }
  };

  const resolveHalfStep = (
    event: React.MouseEvent<HTMLButtonElement>,
    star: number
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? star - 0.5 : star;
  };

  const renderStar = (value: number, index: number, size = 24) => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        className="cursor-pointer transition-opacity hover:opacity-80"
      >
        {children}
      </DialogTrigger>

      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[750px] overflow-hidden p-0 gap-0">
        <div className="h-32 w-full relative bg-[#0f172a]">
          {game.coverUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mask-image-gradient"
              style={{ backgroundImage: `url(${game.coverUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
        </div>

        <div className="px-6 pb-6 -mt-12 flex gap-6 items-start relative z-10">
          {/* CAPA */}
          <div className="flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-950 w-32 h-48 bg-slate-900 aspect-[2/3]">
            {game.coverUrl ? (
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <Gamepad2 size={40} />
              </div>
            )}
          </div>

          <div className="flex-1 pt-14 text-left">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-3xl font-bold mb-2 leading-tight text-white">
                  {game.title}
                </DialogTitle>

                <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
                  <Badge variant="outline" className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>

                  <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                    <Gamepad2 size={12} /> {game.platform || "TBD"}
                  </span>

                  {game.steamAppId && (
                    <>
                      <SteamPriceBadge steamId={game.steamAppId} />
                      <a
                        href={`https://store.steampowered.com/app/${game.steamAppId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 gap-1"
                        >
                          Steam <ExternalLink size={10} />
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {averageRating && (
                <div className="flex flex-col items-end pl-4">
                  <span className="text-yellow-400 font-bold text-3xl flex items-center gap-2">
                    <Star size={20} className="text-yellow-400" />{" "}
                    {averageRating}
                    <span className="text-sm text-slate-600">/5</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {reviews.length} review(s)
                  </span>
                </div>
              )}
            </div>

            {/* PROGRESSO */}
            <div className="mt-8 space-y-4">
              {playedTime > 0 && (
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
                        <History size={14} className="text-purple-400" /> Tempo
                        Jogado
                      </span>
                      <div className="text-xl font-bold text-white flex items-baseline gap-2">
                        {playedTime}h
                        <span className="text-xs text-slate-500 font-normal">
                          de {targetTime}h estimados
                        </span>
                      </div>
                    </div>
                    <span className="text-purple-400 font-bold text-lg">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* GRID HLTB */}
              {(timeMain > 0 || timeExtra > 0 || timeCompletionist > 0) && (
                <div>
                  {!playedTime && (
                    <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock size={14} /> Tempo Estimado (HLTB)
                    </h4>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <TimeCard
                      icon={BookOpen}
                      label="História"
                      time={timeMain}
                      isGoal={game.myGoal === 0}
                    />
                    <TimeCard
                      icon={Clock}
                      label="Extra"
                      time={timeExtra}
                      isGoal={game.myGoal === 1}
                    />
                    <TimeCard
                      icon={Trophy}
                      label="Platina"
                      time={timeCompletionist}
                      isGoal={game.myGoal === 2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comentários / Drop */}
            <div className="space-y-4 mt-6">
              {game.status === 3 && game.droppedReason && (
                <div className="bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r">
                  <h4 className="text-red-400 font-bold flex items-center gap-2 mb-1 text-sm uppercase tracking-wider">
                    <AlertOctagon size={14} /> Motivo da Desistência
                  </h4>
                  <p className="text-slate-300 italic">
                    "{game.droppedReason}"
                  </p>
                </div>
              )}
              {game.comments && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-slate-500 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                    <Quote size={12} /> Anotações
                  </h4>
                  <ScrollArea className="max-h-[200px]">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                      {game.comments}
                    </p>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Star size={12} /> Reviews
                </h4>
                {averageRating && (
                  <div className="text-xs text-slate-500">
                    Média:{" "}
                    <span className="text-yellow-400 font-bold">
                      {averageRating}/5
                    </span>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleCreateReview}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1.5"
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <button
                        key={star}
                        type="button"
                        className="rounded-sm p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        onMouseMove={(e) =>
                          setHoverRating(resolveHalfStep(e, star))
                        }
                        onClick={(e) => setRating(resolveHalfStep(e, star))}
                        aria-label={`Dar nota ${star} estrelas`}
                        title={`Nota ${star}`}
                      >
                        {renderStar(interactiveRating, index)}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-slate-300 font-semibold min-w-[56px]">
                    {interactiveRating.toFixed(1)}/5
                  </span>
                </div>

                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                  placeholder="Sua opinião sobre o jogo..."
                />

                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                  />
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 font-bold gap-2"
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Salvar review
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                {loadingReviews && (
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando
                    reviews...
                  </div>
                )}
                {!loadingReviews && reviews.length === 0 && (
                  <div className="text-slate-500 text-sm">
                    Nenhuma review ainda. Seja o primeiro.
                  </div>
                )}
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-900/40 border border-slate-800 border-l-2 border-l-purple-500 rounded-xl p-4"
                  >
                    {editingId === r.id ? (
                      <div className="space-y-3">
                        <div
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1.5"
                          onMouseLeave={() => setEditHoverRating(null)}
                        >
                          {[1, 2, 3, 4, 5].map((star, index) => (
                            <button
                              key={star}
                              type="button"
                              className="rounded-sm p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                              onMouseMove={(e) =>
                                setEditHoverRating(resolveHalfStep(e, star))
                              }
                              onClick={(e) =>
                                setEditRating(resolveHalfStep(e, star))
                              }
                            >
                              {renderStar(editHoverRating ?? editRating, index)}
                            </button>
                          ))}
                        </div>

                        <Textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="bg-slate-950 border-slate-800"
                          placeholder="Sua opinião sobre o jogo..."
                        />

                        <div className="flex items-center gap-3">
                          <Input
                            type="date"
                            value={editPlayedAt}
                            onChange={(e) => setEditPlayedAt(e.target.value)}
                            className="bg-slate-950 border-slate-800"
                          />
                          <Button
                            onClick={handleUpdateReview}
                            disabled={updating}
                            className="bg-purple-600 hover:bg-purple-700 font-bold gap-2"
                          >
                            {updating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Salvar
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            disabled={updating}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-yellow-400 font-bold flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star, index) => (
                                <span key={star}>
                                  {renderStar(r.rating, index, 14)}
                                </span>
                              ))}
                            </div>
                            <span>{r.rating}/5</span>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs text-slate-500">
                              {r.playedAt
                                ? `Jogado em ${formatDate(r.playedAt)}`
                                : ""}
                            </span>
                            <button
                              onClick={() => {
                                setEditingId(r.id);
                                setEditRating(r.rating);
                                setEditBody(r.body ?? "");
                                setEditPlayedAt(r.playedAt ?? "");
                              }}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteReview(r.id);
                              }}
                              disabled={deleting && deletingId === r.id}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              {deleting && deletingId === r.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                        {r.body && (
                          <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {r.body}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
