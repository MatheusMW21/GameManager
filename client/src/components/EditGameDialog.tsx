'use client';

import { useState } from "react";
import { BacklogGame } from "@/types/game";
import { gameService } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Wand2, Pencil, Calendar, Gamepad2, Trophy, Ghost } from "lucide-react";
import { toast } from "sonner";

interface EditGameDialogProps {
    game: BacklogGame;
    onUpdate: (game: BacklogGame) => Promise<void>;
}

export function EditGameDialog({ game, onUpdate }: EditGameDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchingTime, setIsSearchingTime] = useState(false);

    const [title, setTitle] = useState(game.title);
    const [platform, setPlatform] = useState(game.platform || "TBD");
    const [status, setStatus] = useState(game.status.toString());
    const [rating, setRating] = useState(game.rating?.toString() || "");
    const [coverUrl] = useState(game.coverUrl || ""); 
    const [steamAppId, setSteamAppId] = useState(game.steamAppId || "");
    const [comments, setComments] = useState(game.comments || "");
    const [droppedReason, setDroppedReason] = useState(game.droppedReason || "");

    const [timeMain, setTimeMain] = useState(game.timeMain || 0);
    const [timeExtra, setTimeExtra] = useState(game.timeExtra || 0);
    const [timeCompletionist, setTimeCompletionist] = useState(game.timeCompletionist || 0);
    
    const [timePlayed, setTimePlayed] = useState(game.timePlayed || 0);
    const [myGoal, setMyGoal] = useState(game.myGoal?.toString() || "1");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const updatedGame: BacklogGame = {
            ...game,
            title,
            platform,
            status: Number(status),
            rating: rating ? Number(rating) : undefined,
            coverUrl, 
            steamAppId,
            comments,
            droppedReason: status === "3" ? droppedReason : null,
            
            timeMain,
            timeExtra,
            timeCompletionist,
            timePlayed,
            myGoal: Number(myGoal),
        };

        try {
            await onUpdate(updatedGame);
            setOpen(false);
            toast.success("Jogo atualizado.");
        } catch (error) {
            toast.error("Erro ao salvar alterações.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoTime = async () => {
        setIsSearchingTime(true);
        try {
            const data = await gameService.findHltbTimes(title);
            
            if (data) {
                if (!data.mainStory && !data.mainExtra && !data.completionist) {
                     toast.warning("O banco de dados não possui tempos registrados para este jogo.");
                     return;
                }

                setTimeMain(data.mainStory || 0);
                setTimeExtra(data.mainExtra || 0);
                setTimeCompletionist(data.completionist || 0);
                toast.success("Estimativas aplicadas com sucesso!");
            } else {
                toast.error("Jogo não encontrado na base de dados.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar tempos. Verifique o nome do jogo.");
        } finally {
            setIsSearchingTime(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-white hover:bg-slate-800" title="Editar">
                    <Pencil size={14} />
                </Button>
            </DialogTrigger>
            
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar: {game.title}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-900">
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="times">Tempo & Meta</TabsTrigger>
                        <TabsTrigger value="extras">Anotações</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSave}>
                        
                        <TabsContent value="general" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-900 border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plataforma</Label>
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                            <SelectItem value="0">
                                                <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> Planejando</div>
                                            </SelectItem>
                                            <SelectItem value="1">
                                                <div className="flex items-center gap-2"><Gamepad2 size={14} className="text-blue-400"/> Jogando</div>
                                            </SelectItem>
                                            <SelectItem value="2">
                                                <div className="flex items-center gap-2"><Trophy size={14} className="text-yellow-500"/> Zerado</div>
                                            </SelectItem>
                                            <SelectItem value="3">
                                                <div className="flex items-center gap-2"><Ghost size={14} className="text-red-400"/> Dropado</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Sua Nota (0-10)</Label>
                                    <Input 
                                        type="number" min="0" max="10" step="0.5"
                                        value={rating} 
                                        onChange={e => setRating(e.target.value)} 
                                        onFocus={(e) => e.target.select()}
                                        className="bg-slate-900 border-slate-700 font-bold" 
                                        placeholder="-"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="times" className="space-y-6 py-4">
                            
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-400 uppercase text-xs font-bold tracking-wider">Estimativas (Horas)</Label>
                                    
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleAutoTime} 
                                        disabled={isSearchingTime}
                                        className="text-purple-400 border-purple-500/50 hover:bg-purple-500/10 h-7 text-xs"
                                    >
                                        {isSearchingTime ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <Wand2 className="mr-2 h-3 w-3" />}
                                        {isSearchingTime ? "Buscando..." : "Auto Tempo"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-slate-500">História</Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={timeMain} 
                                            onChange={e => setTimeMain(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="bg-slate-950 border-slate-700 text-center font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-slate-500">Main + Extra</Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={timeExtra} 
                                            onChange={e => setTimeExtra(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="bg-slate-950 border-slate-700 text-center font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-slate-500">Platina</Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={timeCompletionist} 
                                            onChange={e => setTimeCompletionist(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="bg-slate-950 border-slate-700 text-center font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-400 uppercase text-xs font-bold tracking-wider">Qual seu objetivo?</Label>
                                <div className="grid gap-2">
                                    <div 
                                        onClick={() => setMyGoal("0")}
                                        className={`cursor-pointer p-3 rounded border flex justify-between items-center transition-all ${myGoal === "0" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}
                                    >
                                        <div className="text-sm font-medium">Apenas História Principal</div>
                                        <div className="text-xs font-bold text-slate-400">{timeMain}h</div>
                                    </div>

                                    <div 
                                        onClick={() => setMyGoal("1")}
                                        className={`cursor-pointer p-3 rounded border flex justify-between items-center transition-all ${myGoal === "1" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}
                                    >
                                        <div className="text-sm font-medium">História + Extras (Padrão)</div>
                                        <div className="text-xs font-bold text-slate-400">{timeExtra}h</div>
                                    </div>

                                    <div 
                                        onClick={() => setMyGoal("2")}
                                        className={`cursor-pointer p-3 rounded border flex justify-between items-center transition-all ${myGoal === "2" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}
                                    >
                                        <div className="text-sm font-medium">Completista / Platina</div>
                                        <div className="text-xs font-bold text-slate-400">{timeCompletionist}h</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <Label className="text-white font-bold">Jogado até agora (Horas)</Label>
                                <Input 
                                    type="number" 
                                    min="0"
                                    value={timePlayed} 
                                    onChange={e => setTimePlayed(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                                    onFocus={(e) => e.target.select()}
                                    className="bg-slate-900 border-slate-700 h-12 text-lg font-bold text-purple-400" 
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="extras" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Steam App ID (Para monitorar preço)</Label>
                                <Input value={steamAppId} onChange={e => setSteamAppId(e.target.value)} className="bg-slate-900 border-slate-700" placeholder="Ex: 730" />
                                <p className="text-[10px] text-slate-500">Encontre na URL da loja Steam: store.steampowered.com/app/<b>123456</b></p>
                            </div>

                            {status === "3" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-red-400">Motivo da Desistência</Label>
                                    <Input value={droppedReason} onChange={e => setDroppedReason(e.target.value)} className="bg-red-950/20 border-red-900/50 text-red-200 placeholder:text-red-900" placeholder="Ex: Ficou repetitivo..." />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Anotações / Review</Label>
                                <Textarea 
                                    value={comments} 
                                    onChange={e => setComments(e.target.value)} 
                                    className="bg-slate-900 border-slate-700 min-h-[100px]" 
                                    placeholder="O que você achou do jogo? Anote estratégias ou sua opinião final."
                                />
                            </div>
                        </TabsContent>

                        <DialogFooter className="mt-6 gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 font-bold min-w-[100px]">
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}