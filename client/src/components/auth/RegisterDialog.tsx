'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Opcional se quiser logar direto
import { authService } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RegisterDialogProps {
    children?: React.ReactNode;
}

export function RegisterDialog({ children }: RegisterDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await authService.register(name, email, password);
            toast.success("Conta criada! Faça login para continuar.");
            setOpen(false);
        } catch (err: any) {
            const msg = err.response?.data || "Erro ao criar conta.";
            setError(typeof msg === 'string' ? msg : "Erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Criar Conta</Button>}
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Crie sua conta</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleRegister} className="space-y-4 pt-4">
                    {error && (
                        <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-md flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome de Usuário</Label>
                        <Input 
                            id="name" placeholder="Ex: Gamer123" required
                            value={name} onChange={e => setName(e.target.value)}
                            className="bg-slate-900 border-slate-700 focus-visible:ring-purple-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" type="email" placeholder="seu@email.com" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="bg-slate-900 border-slate-700 focus-visible:ring-purple-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input 
                            id="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6}
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="bg-slate-900 border-slate-700 focus-visible:ring-purple-500"
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        Cadastrar
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}