import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations/pt-BR";
import "./global.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GameManager",
  description: "Organize sua vida gamer.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" className="dark">
        <body className={`${inter.className} bg-slate-950 text-slate-100`}>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
