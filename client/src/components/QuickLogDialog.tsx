'use client';

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { gameService } from "@/services/api";
import { toast } from "sonner";
import { Gamepad2, Loader2, Plus, Star } from "lucide-react";

interface IgdbGame {
    id: number;
    name: string;
    cover?: { url: string };
}

export function QuickLogDialog() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 400);
    const [results, setResults] = useState<IgdbGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<IgdbGame | null>(null);

    const [rating, setRating] = useState<number>(4);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [body, setBody] = useState("");
    const [playedAt, setPlayedAt] = useState("");
    const [platform, setPlatform] = useState("PC");
    const [saving, setSaving] = useState(false);
    const interactiveRating = hoverRating ?? rating;

    useEffect(() => {
        if (!open) return;
        setQuery("");
        setResults([]);
        setSelected(null);
        setBody("");
        setPlayedAt("");
        setRating(4);
        setPlatform("PC");
    }, [open]);

    useEffect(() => {
        const load = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const data = await gameService.searchGames(debouncedQuery);
                setResults(data || []);
            } catch {
                toast.error("Erro ao buscar jogos.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [debouncedQuery]);

    const resolveHalfStep = (event: React.MouseEvent<HTMLButtonElement>, star: number) => {
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
                <span className="relative inline-block" style={{ width: size, height: size }}>
                    <Star
                        size={size}
                        className="absolute inset-0 text-slate-600"
                        strokeWidth={1.8}
                    />
                    <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: "50%" }}>
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) {
            toast.error("Selecione um jogo.");
            return;
        }
        if (rating < 1 || rating > 5 || rating % 0.5 !== 0) {
            toast.error("Nota inválida.");
            return;
        }

        setSaving(true);
        try {
            const created = await gameService.create({
                title: selected.name,
                externalId: selected.id.toString(),
                coverUrl: selected.cover?.url,
                platform,
                status: 2,
            });

            await gameService.createReview(created.id, {
                rating,
                body: body.trim() ? body.trim() : undefined,
                playedAt: playedAt ? playedAt : null,
            });

            toast.success("Review publicada.");
            setOpen(false);
        } catch {
            toast.error("Erro ao salvar review.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-2">
                    <Plus size={14} /> Log +
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar último jogo jogado</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar jogo pelo nome..."
                            className="bg-slate-900 border-slate-700"
                        />
                        {loading && (
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                            </div>
                        )}
                        {!selected && results.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {results.map((g) => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => setSelected(g)}
                                        className="text-left bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-purple-500/60 transition-all"
                                    >
                                        <div className="aspect-[2/3] bg-slate-800">
                                            {g.cover?.url ? (
                                                <img src={g.cover.url} alt={g.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                    <Gamepad2 size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 text-xs text-slate-200 line-clamp-2">{g.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selected && (
                            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                                <div className="w-12 h-16 bg-slate-800 rounded overflow-hidden">
                                    {selected.cover?.url ? (
                                        <img src={selected.cover.url} alt={selected.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            <Gamepad2 size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-sm font-bold">{selected.name}</div>
                                <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                                    Trocar
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plataforma</label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                    <SelectItem value="PC">PC</SelectItem>
                                    <SelectItem value="PS5">PS5</SelectItem>
                                    <SelectItem value="PS4">PS4</SelectItem>
                                    <SelectItem value="Xbox Series">Xbox Series</SelectItem>
                                    <SelectItem value="Switch">Switch</SelectItem>
                                    <SelectItem value="TBD">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data jogada</label>
                            <Input
                                type="date"
                                value={playedAt}
                                onChange={(e) => setPlayedAt(e.target.value)}
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sua nota</label>
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
                                        onMouseMove={(e) => setHoverRating(resolveHalfStep(e, star))}
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
                        <div className="text-[10px] text-slate-500">Passe o mouse para escolher (0.5 em 0.5).</div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Review</label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="bg-slate-900 border-slate-700 min-h-[120px]"
                            placeholder="Escreva sua review..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 font-bold" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar review"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
