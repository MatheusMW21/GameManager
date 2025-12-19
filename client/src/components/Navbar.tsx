'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Search, Menu, Bell, LayoutDashboard, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth(); 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:text-purple-400 transition-colors">
            <div className="bg-purple-600 p-1.5 rounded-lg shadow-lg shadow-purple-900/20">
                <Gamepad2 size={20} className="text-white" />
            </div>
            <span>GameManager</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
             {isAuthenticated ? (
                 <>
                    <Link href="/dashboard" className="flex items-center gap-1 text-white hover:text-purple-400 transition-colors">
                        <LayoutDashboard size={16}/> Dashboard
                    </Link>
                    <Link href="/wishlist" className="hover:text-white transition-colors">Minha Lista</Link>
                    <Link href="/discovery" className="hover:text-white transition-colors">Explorar</Link>
                 </>
             ) : (
                 <>
                    <Link href="/features" className="hover:text-white transition-colors">Funcionalidades</Link>
                    <Link href="/community" className="hover:text-white transition-colors">Comunidade</Link>
                 </>
             )}
        </nav>

        <div className="flex items-center gap-4">
            
            <div className="relative hidden sm:block w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                <Input 
                    placeholder="Adicionar jogo..." 
                    className="h-9 pl-9 bg-slate-900 border-slate-800 text-slate-200 focus-visible:ring-purple-500" 
                />
            </div>

            {isAuthenticated ? (
                <div className="flex items-center gap-3">
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white relative">
                        <Bell size={20} />
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="h-8 w-8 rounded bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold border border-slate-700 cursor-pointer hover:border-purple-500 transition-colors text-white">
                                {user?.substring(0, 2).toUpperCase()}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-950 border-slate-800 text-slate-200 mr-4">
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem className="cursor-pointer hover:bg-slate-900">Perfil</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-slate-900">Configurações</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer hover:bg-red-950/20 hover:text-red-300">
                                <LogOut className="mr-2 h-4 w-4" /> Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <LoginDialog>
                        <Button variant="ghost" className="text-slate-300 hover:text-white h-9">Entrar</Button>
                    </LoginDialog>
                    
                    <RegisterDialog>
                        <Button className="bg-white text-slate-950 hover:bg-slate-200 h-9 font-bold">
                            Criar Conta
                        </Button>
                    </RegisterDialog>
                </div>
            )}
            
            <Button variant="ghost" size="icon" className="md:hidden text-slate-400">
                <Menu size={20} />
            </Button>
        </div>
      </div>
    </header>
  );
}