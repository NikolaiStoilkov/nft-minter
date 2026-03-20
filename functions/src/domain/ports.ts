import { TradeOffer, TradeHistoryEntry, MoralisChain, OnChainNFT, MoralisNFTResult, MoralisTransferResult } from "./types";

export interface TradeRepository {
  createTrade: (trade: Omit<TradeOffer, "id" | "status" | "createdAt" | "updatedAt">) => Promise<string>;
  getTrade: (tradeId: string) => Promise<TradeOffer | null>;
  updateTradeStatus: (tradeId: string, status: TradeOffer["status"]) => Promise<void>;
}

export interface NFTRepository {
  verifyOwnership: (nftIds: string[], ownerId: string) => Promise<boolean>;
  transferNFTs: (nftIds: string[], fromUserId: string, toUserId: string) => Promise<void>;
  getWalletAddress: (userId: string) => Promise<string | null>;
  getNFTContractAddress: (nftId: string) => Promise<string | null>;
  getNFTTokenId: (nftId: string) => Promise<string | null>;
}

export interface HistoryRepository {
  recordHistory: (entry: Omit<TradeHistoryEntry, "completedAt">) => Promise<void>;
}

export interface MoralisNFTPort {
  getWalletNFTs: (
    walletAddress: string,
    chain: MoralisChain,
    contractAddress?: string,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisNFTResult>;

  getNFTMetadata: (
    contractAddress: string,
    tokenId: string,
    chain: MoralisChain
  ) => Promise<OnChainNFT | null>;

  getNFTTransfers: (
    walletAddress: string,
    chain: MoralisChain,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisTransferResult>;

  verifyOnChainOwnership: (
    walletAddress: string,
    contractAddress: string,
    tokenIds: string[],
    chain: MoralisChain
  ) => Promise<boolean>;

  getNFTsByContract: (
    contractAddress: string,
    chain: MoralisChain,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisNFTResult>;
}
