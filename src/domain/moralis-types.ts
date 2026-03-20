export type MoralisChain =
  | "eth"
  | "sepolia"
  | "polygon"
  | "mumbai"
  | "base"
  | "base sepolia"
  | "arbitrum"
  | "optimism"
  | "bsc";

export interface OnChainNFT {
  tokenId: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  tokenUri: string | null;
  metadata: Record<string, unknown> | null;
  ownerOf: string;
  chain: MoralisChain;
  amount: string;
  contractType: string;
  lastMetadataSync: string | null;
  lastTokenUriSync: string | null;
}

export interface OnChainTransfer {
  transactionHash: string;
  blockTimestamp: string;
  blockNumber: string;
  blockHash: string;
  tokenId: string;
  tokenAddress: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  contractType: string;
}

export interface MoralisNFTResult {
  total: number;
  page: number;
  pageSize: number;
  cursor: string | null;
  result: OnChainNFT[];
}

export interface MoralisTransferResult {
  total: number;
  page: number;
  pageSize: number;
  cursor: string | null;
  result: OnChainTransfer[];
}

