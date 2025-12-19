'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, AlertCircle } from "lucide-react";

interface LoginDialogProps {
    children?: React.ReactNode; 
}

export function LoginDialog({ children }: LoginDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const data = await authService.login(email, password);
            login(data.token, data.userName);
            setOpen(false); 
        } catch (err) {
            setError("Email ou senha incorretos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="ghost">Entrar</Button>}
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Bem-vindo de volta</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    {error && (
                        <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-md flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

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
                            id="password" type="password" placeholder="••••••••" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="bg-slate-900 border-slate-700 focus-visible:ring-purple-500"
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Entrar
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}