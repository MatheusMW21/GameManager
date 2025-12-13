'use client';

import { useState, useEffect } from "react";
import { BacklogGame } from "@/types/game";
import { gameService } from "@/services/api"; 
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import { Pencil, Loader2, Link as LinkIcon, Wand2, Clock, Trophy, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface EditGameDialogProps {
  game: BacklogGame;
  onUpdate: (updatedGame: BacklogGame) => Promise<void>;
}

export function EditGameDialog({ game, onUpdate }: EditGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingSteam, setIsSearchingSteam] = useState(false);
  const [isSearchingHltb, setIsSearchingHltb] = useState(false);
  
  // Geral
  const [platform, setPlatform] = useState(game.platform || "TBD");
  
  // Usamos STRING para permitir campo vazio enquanto digita
  const [rating, setRating] = useState(game.rating?.toString() || "");
  const [comments, setComments] = useState(game.comments || "");
  const [droppedReason, setDroppedReason] = useState(game.droppedReason || "");
  const [steamAppId, setSteamAppId] = useState(game.steamAppId || "");

  // Tempos (String também)
  const [timeMain, setTimeMain] = useState(game.timeMain?.toString() || "");
  const [timeExtra, setTimeExtra] = useState(game.timeExtra?.toString() || "");
  const [timeCompletionist, setTimeCompletionist] = useState(game.timeCompletionist?.toString() || "");
  const [timePlayed, setTimePlayed] = useState(game.timePlayed?.toString() || "");
  
  const [myGoal, setMyGoal] = useState(game.myGoal?.toString() || "1");

  useEffect(() => {
    if (open) {
        setPlatform(game.platform || "TBD");
        setRating(game.rating?.toString() || "");
        setComments(game.comments || "");
        setDroppedReason(game.droppedReason || "");
        setSteamAppId(game.steamAppId || "");
        
        setTimeMain(game.timeMain?.toString() || "");
        setTimeExtra(game.timeExtra?.toString() || "");
        setTimeCompletionist(game.timeCompletionist?.toString() || "");
        setMyGoal(game.myGoal?.toString() || "1");
        setTimePlayed(game.timePlayed?.toString() || "");
    }
  }, [open, game]);

  // Helper para Inputs Numéricos (Bloqueia negativo)
  const handleNumberInput = (value: string, setter: (val: string) => void, max?: number) => {
    if (value === "") {
        setter("");
        return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    if (num < 0) return; // Bloqueia negativo
    if (max !== undefined && num > max) return; // Bloqueia máximo (ex: nota 10)
    
    setter(value);
  };

  const handleAutoSteam = async () => {
    setIsSearchingSteam(true);
    try {
        const id = await gameService.findSteamId(game.title);
        if (id) {
            setSteamAppId(id);
            toast.success("ID da Steam encontrado!");
        } else {
            toast.warning("Jogo não encontrado na Steam.");
        }
    } catch (error) {
        toast.error("Erro ao buscar na Steam.");
    } finally {
        setIsSearchingSteam(false);
    }
  };

  const handleAutoHltb = async () => {
    setIsSearchingHltb(true);
    try {
        const data = await gameService.findHltbTimes(game.title);
        if (data) {
            // Atualiza os estados com os novos valores (convertendo para string)
            setTimeMain(data.mainStory.toString());
            setTimeExtra(data.mainExtra.toString());
            setTimeCompletionist(data.completionist.toString());
            toast.success("Tempos encontrados!");
        } else {
            toast.warning("Não encontrado na base de dados.");
        }
    } catch (error) {
        toast.error("Erro ao buscar tempos.");
    } finally {
        setIsSearchingHltb(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedGame = {
        ...game,
        platform,
        // Converte string para número ao salvar (vazio vira 0)
        rating: rating === "" ? 0 : Number(rating),
        comments,
        steamAppId,
        droppedReason: game.status === 3 ? droppedReason : null,
        
        timeMain: timeMain === "" ? 0 : Number(timeMain),
        timeExtra: timeExtra === "" ? 0 : Number(timeExtra),
        timeCompletionist: timeCompletionist === "" ? 0 : Number(timeCompletionist),
        myGoal: Number(myGoal),
        timePlayed: timePlayed === "" ? 0 : Number(timePlayed)
      };

      await onUpdate(updatedGame);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-purple-400 transition-colors" title="Editar detalhes">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar: {game.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800">
            <TabsTrigger value="geral" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Geral</TabsTrigger>
            <TabsTrigger value="tempo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Tempo</TabsTrigger>
            <TabsTrigger value="extra" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4 py-4 animate-in fade-in slide-in-from-left-1">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-400">Plataforma</Label>
                <div className="col-span-3">
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectItem value="TBD">A Definir</SelectItem>
                            <SelectItem value="PC">PC (Steam/Epic)</SelectItem>
                            <SelectItem value="PS5">PlayStation 5</SelectItem>
                            <SelectItem value="PS4">PlayStation 4</SelectItem>
                            <SelectItem value="Xbox Series">Xbox Series X|S</SelectItem>
                            <SelectItem value="Switch">Nintendo Switch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-slate-400">Nota (0-10)</Label>
              <Input
                value={rating}
                onChange={e => handleNumberInput(e.target.value, setRating, 10)}
                className="col-span-3 bg-slate-900 border-slate-700 text-slate-200"
              />
            </div>

            {game.status === 3 && (
                <div className="grid grid-cols-4 items-center gap-4 p-3 bg-red-950/10 border border-red-900/30 rounded-lg">
                    <Label className="text-right text-red-400">Motivo Drop</Label>
                    <Input 
                        value={droppedReason} onChange={e => setDroppedReason(e.target.value)} 
                        className="col-span-3 bg-red-950/20 border-red-900/50 text-red-200 placeholder:text-red-800" 
                    />
                </div>
             )}

            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-slate-400 mt-2">Review</Label>
                <Textarea 
                    value={comments} onChange={e => setComments(e.target.value)} 
                    className="col-span-3 bg-slate-900 border-slate-700 text-slate-200 min-h-[100px]" 
                />
            </div>
          </TabsContent>

          <TabsContent value="tempo" className="space-y-6 py-4 animate-in fade-in slide-in-from-right-1">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Estimativas (Horas)</Label>
                    <Button 
                        type="button" variant="outline" size="sm" 
                        onClick={handleAutoHltb} disabled={isSearchingHltb}
                        className="h-6 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                    >
                        {isSearchingHltb ? <Loader2 size={12} className="animate-spin mr-1" /> : <Wand2 size={12} className="mr-1" />}
                        Auto Tempo
                    </Button>
                </div>
                
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 flex items-center gap-1"><BookOpen size={10} /> História</Label>
                  <Input
                    value={timeMain}
                    onChange={e => handleNumberInput(e.target.value, setTimeMain)}
                    className="bg-slate-900 border-slate-700 text-center text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> Main + Extra</Label>
                  <Input
                    value={timeExtra}
                    onChange={e => handleNumberInput(e.target.value, setTimeExtra)}
                    className="bg-slate-900 border-slate-700 text-center text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 flex items-center gap-1"><Trophy size={10} /> Platina</Label>
                  <Input
                    value={timeCompletionist}
                    onChange={e => handleNumberInput(e.target.value, setTimeCompletionist)}
                    className="bg-slate-900 border-slate-700 text-center text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 my-4"></div>

            <div className="space-y-3">
                <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Qual seu objetivo?</Label>
                <RadioGroup value={myGoal} onValueChange={setMyGoal} className="grid grid-cols-1 gap-2">
                    
                    <div className={`flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-900 transition-colors ${myGoal === "0" ? "border-purple-500 bg-purple-900/10" : "border-slate-800"}`}>
                        <RadioGroupItem value="0" id="goal-main" />
                        <Label htmlFor="goal-main" className="flex-1 cursor-pointer font-normal flex justify-between text-slate-300">
                            <span>Apenas História Principal</span>
                            <span className="font-bold text-white">{timeMain || 0}h</span>
                        </Label>
                    </div>

                    <div className={`flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-900 transition-colors ${myGoal === "1" ? "border-purple-500 bg-purple-900/10" : "border-slate-800"}`}>
                        <RadioGroupItem value="1" id="goal-extra" />
                        <Label htmlFor="goal-extra" className="flex-1 cursor-pointer font-normal flex justify-between text-slate-300">
                            <span>História + Extras (Padrão)</span>
                            <span className="font-bold text-white">{timeExtra || 0}h</span>
                        </Label>
                    </div>

                    <div className={`flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-900 transition-colors ${myGoal === "2" ? "border-purple-500 bg-purple-900/10" : "border-slate-800"}`}>
                        <RadioGroupItem value="2" id="goal-comp" />
                        <Label htmlFor="goal-comp" className="flex-1 cursor-pointer font-normal flex justify-between text-slate-300">
                            <span>Completista / Platina</span>
                            <span className="font-bold text-white">{timeCompletionist || 0}h</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

             <div className="grid grid-cols-4 items-center gap-4 pt-2">
                <Label className="text-right text-slate-400">Jogado até agora</Label>
                <div className="col-span-3 relative">
                    <Input 
                        type="number" min={0}
                        value={timePlayed} 
                        onChange={e => handleNumberInput(e.target.value, setTimePlayed)} 
                        className="bg-slate-900 border-slate-700 text-slate-200 pr-12" 
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">Horas</span>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="extra" className="space-y-4 py-4 animate-in fade-in slide-in-from-right-1">
             <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 mb-4">
                <p className="text-sm text-blue-200">Cole o ID da Steam ou busque automaticamente.</p>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-400">Steam App ID</Label>
                <div className="col-span-3 flex gap-2">
                    <div className="relative flex-1">
                        <LinkIcon size={14} className="absolute left-3 top-3 text-slate-500" />
                        <Input 
                            value={steamAppId} onChange={e => setSteamAppId(e.target.value)} 
                            className="pl-8 bg-slate-900 border-slate-700 text-slate-200 font-mono" 
                            placeholder="Ex: 1245620"
                        />
                    </div>
                    <Button 
                        type="button" variant="outline" 
                        onClick={handleAutoSteam} disabled={isSearchingSteam} 
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 min-w-[90px]"
                    >
                        {isSearchingSteam ? <Loader2 size={16} className="animate-spin" /> : <><Wand2 size={16} className="mr-2" /> Auto</>}
                    </Button>
                </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-800 text-slate-400">Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}