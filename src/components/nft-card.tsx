"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RARITY_CONFIG, type NFTItem } from "@/domain/types";

const RARITY_GRADIENTS: Record<NFTItem["rarity"], string> = {
  common: "from-gray-600 to-gray-800",
  uncommon: "from-green-600 to-emerald-800",
  rare: "from-blue-600 to-indigo-800",
  epic: "from-purple-600 to-violet-800",
  legendary: "from-yellow-500 via-orange-500 to-red-600",
};

const RARITY_BORDERS: Record<NFTItem["rarity"], string> = {
  common: "border-gray-500/30",
  uncommon: "border-green-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/50 shadow-lg shadow-yellow-500/10",
};

const RARITY_BADGE: Record<NFTItem["rarity"], "default" | "secondary" | "info" | "success" | "warning"> = {
  common: "secondary",
  uncommon: "success",
  rare: "info",
  epic: "default",
  legendary: "warning",
};

interface NFTCardProps {
  nft: NFTItem;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

export function NFTCard({ nft, selected, selectable, onSelect, compact }: NFTCardProps) {
  const config = RARITY_CONFIG[nft.rarity];

  return (
    <button
      type="button"
      onClick={() => selectable && onSelect?.(nft.id)}
      disabled={!selectable}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border bg-card text-left transition-all duration-300",
        RARITY_BORDERS[nft.rarity],
        selectable && "cursor-pointer hover:scale-[1.02] hover:shadow-xl",
        selected && "ring-2 ring-purple-500 ring-offset-2 ring-offset-background",
        !selectable && "cursor-default"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-gradient-to-br",
          RARITY_GRADIENTS[nft.rarity],
          compact ? "aspect-square" : "aspect-[4/3]"
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("transition-transform group-hover:scale-110", compact ? "text-4xl" : "text-6xl")}>
            {nft.imageEmoji}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={RARITY_BADGE[nft.rarity]} className="text-[10px]">
            {config.label}
          </Badge>
        </div>
        {selected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {nft.rarity === "legendary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}
      </div>
      <div className={cn("p-3", compact && "p-2")}>
        <p className={cn("font-semibold truncate", compact ? "text-xs" : "text-sm")}>{nft.name}</p>
        <p className={cn("font-mono text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
          #{nft.tokenId}
        </p>
      </div>
    </button>
  );
}
