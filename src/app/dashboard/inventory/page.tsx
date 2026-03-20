"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NFTCard } from "@/components/nft-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth-store";
import { useNFTStore } from "@/stores/nft-store";
import { useMintNFT, useSubscribeInventory } from "@/hooks/use-nft";
import { Gem, Loader2, Filter } from "lucide-react";
import type { NFTItem } from "@/domain/types";

type RarityFilter = "all" | "common" | "uncommon" | "rare" | "epic" | "legendary";

export default function InventoryPage() {
  const user = useAuthStore((s) => s.user);
  const inventory = useNFTStore((s) => s.inventory);
  const selectedNfts = useNFTStore((s) => s.selectedNfts);
  const toggleSelectNft = useNFTStore((s) => s.toggleSelectNft);
  const clearSelection = useNFTStore((s) => s.clearSelection);
  const mintNFT = useMintNFT();
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  useSubscribeInventory();

  const filtered = rarityFilter === "all"
    ? inventory
    : inventory.filter((n) => n.rarity === rarityFilter);

  const rarityCount = (rarity: NFTItem["rarity"]) => inventory.filter((n) => n.rarity === rarity).length;

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">{inventory.length} NFTs in your collection</p>
          </div>
          <div className="flex gap-2">
            {selectedNfts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear ({selectedNfts.length})
              </Button>
            )}
            <Button
              onClick={() => mintNFT.mutate()}
              disabled={mintNFT.isPending}
              variant="gradient"
              size="sm"
              className="gap-2"
            >
              {mintNFT.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Minting...</>
              ) : (
                <><Gem className="h-4 w-4" /> Mint NFT</>
              )}
            </Button>
          </div>
        </div>

        {mintNFT.data && (
          <Card className="mb-6 border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-4xl">{mintNFT.data.imageEmoji}</span>
              <div>
                <p className="font-semibold">🎉 Minted: {mintNFT.data.name}</p>
                <Badge variant={mintNFT.data.rarity === "legendary" ? "warning" : "secondary"}>
                  {mintNFT.data.rarity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-5 gap-2 mb-6">
          {(["common", "uncommon", "rare", "epic", "legendary"] as const).map((r) => (
            <Card key={r} className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{rarityCount(r)}</p>
                <p className="text-xs text-muted-foreground capitalize">{r}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={rarityFilter} onValueChange={(v) => setRarityFilter(v as typeof rarityFilter)} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="gap-1">
              <Filter className="h-3 w-3" /> All ({inventory.length})
            </TabsTrigger>
            {(["common", "uncommon", "rare", "epic", "legendary"] as const).map((r) => (
              <TabsTrigger key={r} value={r} className="capitalize">
                {r} ({rarityCount(r)})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="p-12 text-center">
              <Gem className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {inventory.length === 0 ? "No NFTs yet. Mint your first one!" : "No NFTs match this filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                selectable
                selected={selectedNfts.includes(nft.id)}
                onSelect={toggleSelectNft}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
