'use client';

import { useState, useEffect } from "react";
import { BacklogGame } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Loader2, DollarSign } from "lucide-react";

interface EditGameDialogProps {
  game: BacklogGame;
  onUpdate: (updatedGame: BacklogGame) => Promise<void>;
}

export function EditGameDialog({ game, onUpdate }: EditGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [platform, setPlatform] = useState(game.platform || "TBD");
  const [rating, setRating] = useState(game.rating || 0);
  const [comments, setComments] = useState(game.comments || "");
  const [price, setPrice] = useState(game.purchasePrice || 0);
  const [store, setStore] = useState(game.store || "");
  const [droppedReason, setDroppedReason] = useState(game.droppedReason || "");

  useEffect(() => {
    if (open) {
        setPlatform(game.platform || "TBD");
        setRating(game.rating || 0);
        setComments(game.comments || "");
        setPrice(game.purchasePrice || 0);
        setStore(game.store || "");
        setDroppedReason(game.droppedReason || "");
    }
  }, [open, game]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedGame = {
        ...game,
        platform,
        rating: Number(rating),
        comments,
        purchasePrice: Number(price),
        store,
        droppedReason: game.status === 3 ? droppedReason : undefined 
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
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar: {game.title}</DialogTitle>
        </DialogHeader>
        
        {/* Sistema de Abas */}
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800">
            <TabsTrigger value="geral" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Geral</TabsTrigger>
            <TabsTrigger value="extra" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Financeiro & Detalhes</TabsTrigger>
          </TabsList>

          {/* ABA 1: GERAL */}
          <TabsContent value="geral" className="space-y-4 py-4 animate-in fade-in slide-in-from-left-1">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-400">Plataforma</Label>
                <div className="col-span-3">
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
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
                    type="number" 
                    min={0} max={10} 
                    value={rating} 
                    onChange={e => setRating(Number(e.target.value))} 
                    className="col-span-3 bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-purple-500" 
                />
            </div>

             {/* CAMPO CONDICIONAL: Dropado */}
             {game.status === 3 && (
                <div className="grid grid-cols-4 items-center gap-4 p-3 bg-red-950/10 border border-red-900/30 rounded-lg">
                    <Label className="text-right text-red-400 font-semibold">Motivo Drop</Label>
                    <Input 
                        placeholder="Ex: Muito difícil, repetitivo..." 
                        value={droppedReason} 
                        onChange={e => setDroppedReason(e.target.value)} 
                        className="col-span-3 bg-red-950/20 border-red-900/50 text-red-200 placeholder:text-red-800 focus-visible:ring-red-500" 
                    />
                </div>
             )}

            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-slate-400 mt-2">Review</Label>
                <Textarea 
                    value={comments} 
                    onChange={e => setComments(e.target.value)} 
                    placeholder="Escreva suas observações..."
                    className="col-span-3 bg-slate-900 border-slate-700 text-slate-200 min-h-[100px] focus-visible:ring-purple-500" 
                />
            </div>
          </TabsContent>

          {/* ABA 2: FINANCEIRO */}
          <TabsContent value="extra" className="space-y-4 py-4 animate-in fade-in slide-in-from-right-1">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-400">Preço Pago</Label>
                <div className="col-span-3 relative">
                    <DollarSign size={14} className="absolute left-3 top-3 text-emerald-500" />
                    <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={price} 
                        onChange={e => setPrice(Number(e.target.value))} 
                        className="pl-8 bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-slate-400">Loja</Label>
                <Input 
                    placeholder="Ex: Steam, Nuuvem, PSN..." 
                    value={store} 
                    onChange={e => setStore(e.target.value)} 
                    className="col-span-3 bg-slate-900 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" 
                />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-800 text-slate-400">Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}