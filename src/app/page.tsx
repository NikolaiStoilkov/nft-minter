"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useSignIn } from "@/hooks/use-auth";
import {
  Gem,
  ArrowLeftRight,
  TrendingUp,
  Package,
  ChevronRight,
  Sparkles,
  Trophy,
  Flame,
  Crown,
} from "lucide-react";

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const signIn = useSignIn();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-600/15 blur-[150px]" />
            <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px] animate-glow-pulse" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5 text-sm border-purple-500/30 bg-purple-500/5 inline-flex">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-purple-300">The NFT Trading Platform</span>
                </Badge>

                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                  <span className="text-foreground">Trade NFTs</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Like Never Before
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed mx-auto lg:mx-0">
                  Mint rare collectibles, build your dream collection, and trade peer-to-peer with
                  collectors worldwide. Every trade is instant, secure, and tracked.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  {user ? (
                    <Link href="/dashboard">
                      <Button variant="gradient" size="xl" className="gap-2">
                        Open Dashboard <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={signIn} variant="gradient" size="xl" className="gap-2">
                      Start Trading — Free <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                  <a href="#how-it-works">
                    <Button variant="outline" size="xl" className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200">
                      How It Works
                    </Button>
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                  {[
                    { value: "5", label: "Rarity Tiers", icon: "💎" },
                    { value: "P2P", label: "Direct Trades", icon: "🔄" },
                    { value: "Live", label: "Tracking", icon: "⚡" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-purple-300">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative w-full max-w-lg">
                <div className="relative aspect-square">
                  <div className="absolute inset-8 rounded-full bg-purple-500/20 blur-[60px]" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-72 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 p-0.5 shadow-2xl shadow-purple-500/30 animate-float">
                      <div className="h-full w-full rounded-3xl bg-card flex flex-col items-center justify-center gap-3">
                        <span className="text-7xl">🔮</span>
                        <div className="text-center">
                          <p className="font-bold text-purple-200">Mystic Orb</p>
                          <Badge variant="default" className="mt-1 bg-purple-500/20 text-purple-300 border-0">Epic</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 w-32 h-40 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-0.5 shadow-xl shadow-yellow-500/20 animate-float-delayed -rotate-12">
                    <div className="h-full w-full rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
                      <span className="text-4xl">👑</span>
                      <p className="text-xs font-bold text-yellow-300">Legendary</p>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-4 w-28 h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/20 animate-float-slow rotate-6">
                    <div className="h-full w-full rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">💎</span>
                      <p className="text-xs font-bold text-blue-300">Rare</p>
                    </div>
                  </div>

                  <div className="absolute top-8 right-8 w-20 h-24 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-0.5 shadow-lg shadow-green-500/20 animate-float rotate-12 opacity-80">
                    <div className="h-full w-full rounded-xl bg-card flex items-center justify-center">
                      <span className="text-2xl">🛡️</span>
                    </div>
                  </div>

                  <div className="absolute top-1/4 right-1/4 text-purple-400 animate-glow-pulse">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/4 text-fuchsia-400 animate-glow-pulse" style={{ animationDelay: "1s" }}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold sm:text-5xl">
                Five Tiers of{" "}
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Rarity</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
                Every mint is a surprise. Will you unbox a Common — or strike gold with a Legendary?
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {[
                { rarity: "Common", emoji: "🗡️", gradient: "from-slate-500 to-slate-700", chance: "40%", glow: "shadow-slate-500/10" },
                { rarity: "Uncommon", emoji: "🛡️", gradient: "from-emerald-500 to-green-700", chance: "30%", glow: "shadow-emerald-500/10" },
                { rarity: "Rare", emoji: "💎", gradient: "from-blue-500 to-indigo-700", chance: "15%", glow: "shadow-blue-500/15" },
                { rarity: "Epic", emoji: "🔮", gradient: "from-purple-500 to-violet-700", chance: "10%", glow: "shadow-purple-500/20" },
                { rarity: "Legendary", emoji: "👑", gradient: "from-yellow-400 via-orange-500 to-red-500", chance: "5%", glow: "shadow-yellow-500/25" },
              ].map((r) => (
                <Card key={r.rarity} className={`overflow-hidden border-purple-500/10 bg-card/80 group hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl ${r.glow}`}>
                  <div className={`aspect-square bg-gradient-to-br ${r.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-5xl sm:text-6xl group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">
                      {r.emoji}
                    </span>
                    {r.rarity === "Legendary" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    )}
                  </div>
                  <CardContent className="p-4 text-center">
                    <p className="font-bold">{r.rarity}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.chance} drop rate</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-5xl">
                How{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Trading</span>{" "}
                Works
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
                Three simple steps to start collecting and trading
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Gem,
                  title: "Mint NFTs",
                  description: "Hit mint and receive a randomized collectible. Each has a unique name, emoji, and rarity tier. Build your collection one mint at a time.",
                  accent: "from-purple-500 to-violet-600",
                },
                {
                  step: "02",
                  icon: ArrowLeftRight,
                  title: "Propose Trades",
                  description: "Browse other collectors, check out their inventory, and send trade offers. Select which NFTs to swap — it's all peer-to-peer.",
                  accent: "from-fuchsia-500 to-pink-600",
                },
                {
                  step: "03",
                  icon: Trophy,
                  title: "Collect & Climb",
                  description: "Accept incoming offers, grow your legendary count, and track every trade in your history. The rarest collections win.",
                  accent: "from-pink-500 to-rose-600",
                },
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <Card className="h-full border-purple-500/10 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-purple-500/25 transition-all duration-300">
                    <CardContent className="p-8">
                      <span className="text-6xl font-black text-purple-500/10 absolute top-4 right-6 select-none">
                        {item.step}
                      </span>
                      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} shadow-lg shadow-purple-500/20`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-purple-100">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold sm:text-5xl">
                Trade{" "}
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Anything</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
                Every collector has something you want. Make an offer they can&apos;t refuse.
              </p>
            </div>

            <Card className="border-purple-500/20 bg-card/60 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">You offer</p>
                    <div className="flex justify-center gap-3">
                      <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-3xl">🛡️</span>
                      </div>
                      <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/10">
                        <span className="text-3xl">🗡️</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">2 × Uncommon</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                      <ArrowLeftRight className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-xs text-purple-400 font-medium">SWAP</p>
                  </div>

                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">You receive</p>
                    <div className="flex justify-center">
                      <div className="w-24 h-28 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-xl shadow-purple-500/25 ring-2 ring-purple-500/30">
                        <span className="text-4xl">🔮</span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-300 mt-3 font-medium">1 × Epic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <Crown className="h-12 w-12 mx-auto mb-6 text-purple-400" />
            <h2 className="text-4xl font-bold sm:text-6xl mb-4 leading-tight">
              Your collection{" "}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                awaits
              </span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
              Sign in and mint your first NFT in seconds. Start building something legendary.
            </p>
            {user ? (
              <Link href="/dashboard">
                <Button variant="gradient" size="xl">
                  Open Dashboard <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button onClick={signIn} variant="gradient" size="xl">
                Start Collecting <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </section>

        <footer className="border-t border-purple-500/10 py-8">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                <Gem className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-purple-300">NFT Trader</span>
            </div>
            <p className="text-muted-foreground/60">© 2026 NFT Trader. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
