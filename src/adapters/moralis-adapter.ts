import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type {
  OnChainNFT,
  MoralisNFTResult,
  MoralisTransferResult,
  MoralisChain,
} from "@/domain/moralis-types";

export interface MoralisClientPort {
  getWalletNFTs: (
    walletAddress: string,
    chain?: MoralisChain,
    contractAddress?: string,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisNFTResult>;

  getNFTMetadata: (
    contractAddress: string,
    tokenId: string,
    chain?: MoralisChain
  ) => Promise<OnChainNFT>;

  getWalletNFTTransfers: (
    walletAddress: string,
    chain?: MoralisChain,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisTransferResult>;

  getNFTsByContract: (
    contractAddress: string,
    chain?: MoralisChain,
    cursor?: string,
    limit?: number
  ) => Promise<MoralisNFTResult>;
}

const call = <T, R>(name: string) =>
  async (data: T): Promise<R> => {
    const fn = httpsCallable<T, R>(functions, name);
    const result = await fn(data);
    return result.data;
  };

const getWalletNFTs: MoralisClientPort["getWalletNFTs"] = (
  walletAddress, chain, contractAddress, cursor, limit
) =>
  call<object, MoralisNFTResult>("getWalletNFTs")({
    walletAddress, chain, contractAddress, cursor, limit,
  });

const getNFTMetadata: MoralisClientPort["getNFTMetadata"] = (
  contractAddress, tokenId, chain
) =>
  call<object, OnChainNFT>("getNFTMetadata")({ contractAddress, tokenId, chain });

const getWalletNFTTransfers: MoralisClientPort["getWalletNFTTransfers"] = (
  walletAddress, chain, cursor, limit
) =>
  call<object, MoralisTransferResult>("getWalletNFTTransfers")({
    walletAddress, chain, cursor, limit,
  });

const getNFTsByContract: MoralisClientPort["getNFTsByContract"] = (
  contractAddress, chain, cursor, limit
) =>
  call<object, MoralisNFTResult>("getNFTsByContract")({
    contractAddress, chain, cursor, limit,
  });

export const moralisClientAdapter: MoralisClientPort = {
  getWalletNFTs,
  getNFTMetadata,
  getWalletNFTTransfers,
  getNFTsByContract,
};

