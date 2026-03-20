import type { NFTItem, TradeOffer, TradeHistoryEntry, UserProfile } from "@/domain/types";

export interface AuthPort {
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => () => void;
  getCurrentUser: () => UserProfile | null;
}

export interface NFTPort {
  mintNFT: (userId: string) => Promise<NFTItem>;
  getUserNFTs: (userId: string) => Promise<NFTItem[]>;
  getNFTById: (nftId: string) => Promise<NFTItem | null>;
  subscribeToUserNFTs: (userId: string, callback: (nfts: NFTItem[]) => void) => () => void;
}

export interface TradePort {
  createTradeOffer: (offer: Omit<TradeOffer, "id" | "status" | "createdAt" | "updatedAt">) => Promise<string>;
  acceptTrade: (tradeId: string) => Promise<void>;
  rejectTrade: (tradeId: string) => Promise<void>;
  cancelTrade: (tradeId: string) => Promise<void>;
  getIncomingOffers: (userId: string) => Promise<TradeOffer[]>;
  getOutgoingOffers: (userId: string) => Promise<TradeOffer[]>;
  subscribeToIncomingOffers: (userId: string, callback: (offers: TradeOffer[]) => void) => () => void;
}

export interface HistoryPort {
  getTradeHistory: (userId: string) => Promise<TradeHistoryEntry[]>;
  subscribeToHistory: (userId: string, callback: (entries: TradeHistoryEntry[]) => void) => () => void;
}

export interface UserPort {
  getUserProfile: (uid: string) => Promise<UserProfile | null>;
  searchUsers: (queryStr: string, currentUserId: string) => Promise<UserProfile[]>;
  getAllUsers: (currentUserId: string) => Promise<UserProfile[]>;
}
