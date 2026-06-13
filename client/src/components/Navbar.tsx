"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { Gamepad2 } from "lucide-react";
import { QuickLogDialog } from "./QuickLogDialog";

export function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="text-purple-500" size={24} />
          <span className="font-bold text-xl tracking-tight text-white">
            GameManager
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/discovery"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Explorar
          </Link>
          <Link
            href="/diary"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Diário
          </Link>

          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <QuickLogDialog />
              <span className="text-sm text-slate-400 hidden md:block">
                Olá, {user.firstName}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
