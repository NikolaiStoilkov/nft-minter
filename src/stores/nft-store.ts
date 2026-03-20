import { create } from "zustand";
import type { NFTItem } from "@/domain/types";

interface NFTState {
  inventory: NFTItem[];
  selectedNfts: string[];
  isMinting: boolean;
  setInventory: (nfts: NFTItem[]) => void;
  addToInventory: (nft: NFTItem) => void;
  setMinting: (minting: boolean) => void;
  toggleSelectNft: (nftId: string) => void;
  clearSelection: () => void;
  isSelected: (nftId: string) => boolean;
}

export const useNFTStore = create<NFTState>()((set, get) => ({
  inventory: [],
  selectedNfts: [],
  isMinting: false,
  setInventory: (nfts) => {
    const seen = new Set<string>();
    const unique = nfts.filter((nft) => {
      if (seen.has(nft.id)) return false;
      seen.add(nft.id);
      return true;
    });
    set({ inventory: unique });
  },
  addToInventory: (nft) =>
    set((s) => {
      if (s.inventory.some((n) => n.id === nft.id)) return s;
      return { inventory: [nft, ...s.inventory] };
    }),
  setMinting: (isMinting) => set({ isMinting }),
  toggleSelectNft: (nftId) =>
    set((s) => ({
      selectedNfts: s.selectedNfts.includes(nftId)
        ? s.selectedNfts.filter((id) => id !== nftId)
        : [...s.selectedNfts, nftId],
    })),
  clearSelection: () => set({ selectedNfts: [] }),
  isSelected: (nftId) => get().selectedNfts.includes(nftId),
}));
