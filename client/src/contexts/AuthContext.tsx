'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
    user: string | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, userName: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('gameboxd_token');
        const storedUser = localStorage.getItem('gameboxd_user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
        }
    }, []);

    const login = (newToken: string, newUser: string) => {
        localStorage.setItem('gameboxd_token', newToken);
        localStorage.setItem('gameboxd_user', newUser);
        setToken(newToken);
        setUser(newUser);
        toast.success(`Bem-vindo de volta, ${newUser}!`);
        router.refresh();
    };

    const logout = () => {
        localStorage.removeItem('gameboxd_token');
        localStorage.removeItem('gameboxd_user');
        setToken(null);
        setUser(null);
        toast.info("Você saiu da conta.");
        router.push('/'); 
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);