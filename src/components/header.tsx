"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useSignIn, useSignOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  History,
  Gem,
} from "lucide-react";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/10 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110">
            <Gem className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
            NFT Trader
          </span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-purple-200/70 hover:text-purple-100">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="sm" className="gap-2 text-purple-200/70 hover:text-purple-100">
                <Package className="h-4 w-4" /> Inventory
              </Button>
            </Link>
            <Link href="/dashboard/trade">
              <Button variant="ghost" size="sm" className="gap-2 text-purple-200/70 hover:text-purple-100">
                <ArrowLeftRight className="h-4 w-4" /> Trade
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-2 text-purple-200/70 hover:text-purple-100">
                <History className="h-4 w-4" /> History
              </Button>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 ring-2 ring-purple-500/30">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-xs">
                      {user.displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="md:hidden">
                  <Link href="/dashboard">
                    <DropdownMenuItem className="gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/inventory">
                    <DropdownMenuItem className="gap-2">
                      <Package className="h-4 w-4" /> Inventory
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/trade">
                    <DropdownMenuItem className="gap-2">
                      <ArrowLeftRight className="h-4 w-4" /> Trade
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/history">
                    <DropdownMenuItem className="gap-2">
                      <History className="h-4 w-4" /> History
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={signOut} className="gap-2 text-red-400 focus:text-red-400">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signIn} variant="gradient" size="sm" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
