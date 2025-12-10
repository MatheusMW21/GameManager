'use client';

import { useState } from "react";
import { BacklogGame } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Pencil, Loader2 } from "lucide-react";

interface EditGameDialogProps {
  game: BacklogGame;
  onUpdate: (updatedGame: BacklogGame) => Promise<void>;
}

export function EditGameDialog({ game, onUpdate }: EditGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [platform, setPlatform] = useState(game.platform || "PC");
  const [rating, setRating] = useState(game.rating || 0);
  const [comments, setComments] = useState(game.comments || ""); 

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedGame = {
        ...game,
        platform,
        rating: Number(rating),
        comments
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
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-purple-400">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Detalhes</DialogTitle>
          <DialogDescription className="text-slate-400">
            Atualize as informações de {game.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Campo: Plataforma */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="platform" className="text-right text-slate-300">
              Plataforma
            </Label>
            <div className="col-span-3">
                <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="PC">PC (Steam/Epic)</SelectItem>
                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                    <SelectItem value="PS4">PlayStation 4</SelectItem>
                    <SelectItem value="Xbox Series">Xbox Series X|S</SelectItem>
                    <SelectItem value="Switch">Nintendo Switch</SelectItem>
                    <SelectItem value="TBD">A definir</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Campo: Nota (0-10) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right text-slate-300">
              Nota (0-10)
            </Label>
            <Input
              id="rating"
              type="number"
              min={0}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="col-span-3 bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          {/* Campo: Comentários */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comments" className="text-right text-slate-300">
              Review
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="O que achou do jogo?"
              className="col-span-3 bg-slate-800 border-slate-700 text-slate-100 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-800 hover:text-white">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}