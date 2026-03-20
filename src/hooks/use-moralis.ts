import { useQuery } from "@tanstack/react-query";
import { moralisClientAdapter } from "@/adapters/moralis-adapter";
import type { MoralisChain } from "@/domain/moralis-types";

export const useWalletNFTs = (
  walletAddress: string | undefined,
  chain: MoralisChain = "sepolia",
  contractAddress?: string,
  limit?: number
) =>
  useQuery({
    queryKey: ["moralis", "walletNFTs", walletAddress, chain, contractAddress],
    queryFn: () =>
      moralisClientAdapter.getWalletNFTs(walletAddress!, chain, contractAddress, undefined, limit),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });

export const useNFTMetadata = (
  contractAddress: string | undefined,
  tokenId: string | undefined,
  chain: MoralisChain = "sepolia"
) =>
  useQuery({
    queryKey: ["moralis", "nftMetadata", contractAddress, tokenId, chain],
    queryFn: () => moralisClientAdapter.getNFTMetadata(contractAddress!, tokenId!, chain),
    enabled: !!contractAddress && !!tokenId,
    staleTime: 60_000,
  });

export const useWalletNFTTransfers = (
  walletAddress: string | undefined,
  chain: MoralisChain = "sepolia",
  limit?: number
) =>
  useQuery({
    queryKey: ["moralis", "nftTransfers", walletAddress, chain],
    queryFn: () =>
      moralisClientAdapter.getWalletNFTTransfers(walletAddress!, chain, undefined, limit),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });

export const useNFTsByContract = (
  contractAddress: string | undefined,
  chain: MoralisChain = "sepolia",
  limit?: number
) =>
  useQuery({
    queryKey: ["moralis", "nftsByContract", contractAddress, chain],
    queryFn: () =>
      moralisClientAdapter.getNFTsByContract(contractAddress!, chain, undefined, limit),
    enabled: !!contractAddress,
    staleTime: 60_000,
  });

