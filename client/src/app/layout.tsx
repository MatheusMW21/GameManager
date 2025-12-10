import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css"; 
import { Toaster } from "@/components/ui/sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Backlog",
  description: "Gerenciador de jogos e backlog pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark"> 
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
        {/* Componente de notificações moderno */}
        <Toaster richColors position="top-right" /> 
      </body>
    </html>
  );
}