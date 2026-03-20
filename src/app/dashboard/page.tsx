"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NFTCard } from "@/components/nft-card";
import { useAuthStore } from "@/stores/auth-store";
import { useNFTStore } from "@/stores/nft-store";
import { useMintNFT, useSubscribeInventory } from "@/hooks/use-nft";
import { useIncomingOffers } from "@/hooks/use-trade";
import { useSignIn } from "@/hooks/use-auth";
import { Gem, Package, ArrowLeftRight, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const user = useAuthStore((s) => s.user);
	const isLoading = useAuthStore((s) => s.isLoading);
	const inventory = useNFTStore((s) => s.inventory);
	const signIn = useSignIn();
	const mintNFT = useMintNFT();
	const { data: incoming } = useIncomingOffers();

	useSubscribeInventory();

	if (isLoading) {
		return (
			<>
				<Header />
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
				</div>
			</>
		);
	}

	if (!user) {
		return (
			<>
				<Header />
				<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
					<Gem className="h-12 w-12 text-purple-500" />
					<h2 className="text-2xl font-bold">Sign in to continue</h2>
					<p className="text-muted-foreground">You need to be logged in to access the dashboard</p>
					<Button onClick={signIn} variant="gradient" size="lg">
						Sign in with Google
					</Button>
				</div>
			</>
		);
	}

	const recentNfts = inventory.slice(0, 4);

	return (
		<>
			<Header />
			<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Welcome back, {user.displayName?.split(" ")[0]}! 👋</h1>
					<p className="text-muted-foreground mt-1">Here&apos;s your NFT overview</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-3 mb-8">
					<Card className="bg-card/50 backdrop-blur-sm border-border/50">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total NFTs</p>
									<p className="text-3xl font-bold">{inventory.length}</p>
								</div>
								<Package className="h-8 w-8 text-purple-400" />
							</div>
						</CardContent>
					</Card>
					<Card className="bg-card/50 backdrop-blur-sm border-border/50">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Legendaries</p>
									<p className="text-3xl font-bold text-yellow-400">
										{inventory.filter((n) => n.rarity === "legendary").length}
									</p>
								</div>
								<span className="text-3xl">👑</span>
							</div>
						</CardContent>
					</Card>
					<Card className="bg-card/50 backdrop-blur-sm border-border/50">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Pending Trades</p>
									<p className="text-3xl font-bold">{incoming?.length || 0}</p>
								</div>
								<ArrowLeftRight className="h-8 w-8 text-blue-400" />
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className="mb-8 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border-purple-500/20">
					<CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold">Mint a new NFT</h3>
							<p className="text-sm text-muted-foreground">Try your luck — will you get a Legendary?</p>
						</div>
						<Button
							onClick={() => mintNFT.mutate()}
							disabled={mintNFT.isPending}
							variant="gradient"
							size="lg"
							className="gap-2 shrink-0"
						>
							{mintNFT.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" /> Minting...
								</>
							) : (
								<>
									<Gem className="h-4 w-4" /> Mint NFT
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{mintNFT.data && (
					<Card className="mb-8 border-green-500/30 bg-green-500/5">
						<CardContent className="p-4 flex items-center gap-4">
							<span className="text-4xl">{mintNFT.data.imageEmoji}</span>
							<div>
								<p className="font-semibold">🎉 You minted {mintNFT.data.name}!</p>
								<div className="flex gap-2 mt-1">
									<Badge variant="info">#{mintNFT.data.tokenId}</Badge>
									<Badge
										variant={
											mintNFT.data.rarity === "legendary"
												? "warning"
												: mintNFT.data.rarity === "epic"
												? "default"
												: "secondary"
										}
									>
										{mintNFT.data.rarity}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				<Card className="bg-card/50 backdrop-blur-sm border-border/50">
					<CardHeader className="flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent NFTs</CardTitle>
						<Link href="/dashboard/inventory">
							<Button variant="ghost" size="sm" className="gap-1">
								View All <ChevronRight className="h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						{recentNfts.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">No NFTs yet. Mint your first one above!</p>
						) : (
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								{recentNfts.map((nft) => (
									<NFTCard key={nft.id} nft={nft} compact />
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
