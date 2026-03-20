import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { createTradeRepo, createNFTRepo, createHistoryRepo } from "./adapters/firestore-adapter";
import { createMoralisAdapter } from "./adapters/moralis-adapter";
import { MoralisChain } from "./domain/types";

admin.initializeApp();

const tradeRepo = createTradeRepo();
const nftRepo = createNFTRepo();
const historyRepo = createHistoryRepo();
const moralis = createMoralisAdapter();

const DEFAULT_CHAIN: MoralisChain = (process.env.NFT_CHAIN as MoralisChain) ?? "sepolia";

const verifyOnChainIfPossible = async (
  nftIds: string[],
  userId: string
): Promise<void> => {
  if (nftIds.length === 0) return;
  const walletAddress = await nftRepo.getWalletAddress(userId);
  if (!walletAddress) return;

  const nftSnaps = await Promise.all(nftIds.map(async (id) => ({
    id,
    contractAddress: await nftRepo.getNFTContractAddress(id),
    tokenId: await nftRepo.getNFTTokenId(id),
  })));

  const byContract = new Map<string, string[]>();
  for (const { contractAddress, tokenId } of nftSnaps) {
    if (!contractAddress || !tokenId) continue;
    const existing = byContract.get(contractAddress) ?? [];
    existing.push(tokenId);
    byContract.set(contractAddress, existing);
  }

  for (const [contractAddress, tokenIds] of byContract.entries()) {
    const owns = await moralis.verifyOnChainOwnership(
      walletAddress,
      contractAddress,
      tokenIds,
      DEFAULT_CHAIN
    );
    if (!owns) {
      throw new HttpsError(
        "failed-precondition",
        `On-chain verification failed: wallet ${walletAddress} does not own all NFTs for contract ${contractAddress}`
      );
    }
  }
};

export const createTrade = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Must be logged in");

  const { fromUserId, fromUserName, toUserId, toUserName, offeredNftIds, requestedNftIds } = request.data;

  if (uid !== fromUserId) {
    throw new HttpsError("permission-denied", "Cannot create trade on behalf of another user");
  }

  if ((!offeredNftIds || offeredNftIds.length === 0) && (!requestedNftIds || requestedNftIds.length === 0)) {
    throw new HttpsError("invalid-argument", "Trade must include at least one NFT");
  }

  if (fromUserId === toUserId) {
    throw new HttpsError("invalid-argument", "Cannot trade with yourself");
  }

  if (offeredNftIds && offeredNftIds.length > 0) {
    const ownsAll = await nftRepo.verifyOwnership(offeredNftIds, fromUserId);
    if (!ownsAll) {
      throw new HttpsError("failed-precondition", "You don't own all offered NFTs");
    }
    await verifyOnChainIfPossible(offeredNftIds, fromUserId);
  }

  if (requestedNftIds && requestedNftIds.length > 0) {
    const ownsAll = await nftRepo.verifyOwnership(requestedNftIds, toUserId);
    if (!ownsAll) {
      throw new HttpsError("failed-precondition", "Target user doesn't own all requested NFTs");
    }
    await verifyOnChainIfPossible(requestedNftIds, toUserId);
  }

  const tradeId = await tradeRepo.createTrade({
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    offeredNftIds: offeredNftIds || [],
    requestedNftIds: requestedNftIds || [],
  });

  return { tradeId };
});

export const acceptTrade = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Must be logged in");

  const { tradeId } = request.data;
  if (!tradeId) throw new HttpsError("invalid-argument", "tradeId is required");

  const trade = await tradeRepo.getTrade(tradeId);
  if (!trade) throw new HttpsError("not-found", "Trade not found");
  if (trade.status !== "pending") throw new HttpsError("failed-precondition", "Trade is no longer pending");
  if (trade.toUserId !== uid) throw new HttpsError("permission-denied", "Only the recipient can accept");

  if (trade.offeredNftIds.length > 0) {
    const fromOwns = await nftRepo.verifyOwnership(trade.offeredNftIds, trade.fromUserId);
    if (!fromOwns) throw new HttpsError("failed-precondition", "Sender no longer owns offered NFTs");
    await verifyOnChainIfPossible(trade.offeredNftIds, trade.fromUserId);
  }

  if (trade.requestedNftIds.length > 0) {
    const toOwns = await nftRepo.verifyOwnership(trade.requestedNftIds, trade.toUserId);
    if (!toOwns) throw new HttpsError("failed-precondition", "You no longer own the requested NFTs");
    await verifyOnChainIfPossible(trade.requestedNftIds, trade.toUserId);
  }

  if (trade.offeredNftIds.length > 0) {
    await nftRepo.transferNFTs(trade.offeredNftIds, trade.fromUserId, trade.toUserId);
  }
  if (trade.requestedNftIds.length > 0) {
    await nftRepo.transferNFTs(trade.requestedNftIds, trade.toUserId, trade.fromUserId);
  }

  await tradeRepo.updateTradeStatus(tradeId, "accepted");

  await historyRepo.recordHistory({
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "accepted",
    participants: [trade.fromUserId, trade.toUserId],
  });

  return { success: true };
});

export const rejectTrade = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Must be logged in");

  const { tradeId } = request.data;
  if (!tradeId) throw new HttpsError("invalid-argument", "tradeId is required");

  const trade = await tradeRepo.getTrade(tradeId);
  if (!trade) throw new HttpsError("not-found", "Trade not found");
  if (trade.status !== "pending") throw new HttpsError("failed-precondition", "Trade is no longer pending");
  if (trade.toUserId !== uid) throw new HttpsError("permission-denied", "Only the recipient can reject");

  await tradeRepo.updateTradeStatus(tradeId, "rejected");

  await historyRepo.recordHistory({
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "rejected",
    participants: [trade.fromUserId, trade.toUserId],
  });

  return { success: true };
});

export const cancelTrade = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Must be logged in");

  const { tradeId } = request.data;
  if (!tradeId) throw new HttpsError("invalid-argument", "tradeId is required");

  const trade = await tradeRepo.getTrade(tradeId);
  if (!trade) throw new HttpsError("not-found", "Trade not found");
  if (trade.status !== "pending") throw new HttpsError("failed-precondition", "Trade is no longer pending");
  if (trade.fromUserId !== uid) throw new HttpsError("permission-denied", "Only the sender can cancel");

  await tradeRepo.updateTradeStatus(tradeId, "cancelled");

  await historyRepo.recordHistory({
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "cancelled",
    participants: [trade.fromUserId, trade.toUserId],
  });

  return { success: true };
});

export const getWalletNFTs = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be logged in");

  const { walletAddress, chain, contractAddress, cursor, limit } = request.data as {
    walletAddress: string;
    chain?: MoralisChain;
    contractAddress?: string;
    cursor?: string;
    limit?: number;
  };

  if (!walletAddress) throw new HttpsError("invalid-argument", "walletAddress is required");

  const result = await moralis.getWalletNFTs(
    walletAddress,
    chain ?? DEFAULT_CHAIN,
    contractAddress,
    cursor,
    limit
  );

  return result;
});

export const getNFTMetadata = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be logged in");

  const { contractAddress, tokenId, chain } = request.data as {
    contractAddress: string;
    tokenId: string;
    chain?: MoralisChain;
  };

  if (!contractAddress) throw new HttpsError("invalid-argument", "contractAddress is required");
  if (!tokenId) throw new HttpsError("invalid-argument", "tokenId is required");

  const result = await moralis.getNFTMetadata(
    contractAddress,
    tokenId,
    chain ?? DEFAULT_CHAIN
  );

  if (!result) throw new HttpsError("not-found", "NFT metadata not found");
  return result;
});

export const getWalletNFTTransfers = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be logged in");

  const { walletAddress, chain, cursor, limit } = request.data as {
    walletAddress: string;
    chain?: MoralisChain;
    cursor?: string;
    limit?: number;
  };

  if (!walletAddress) throw new HttpsError("invalid-argument", "walletAddress is required");

  const result = await moralis.getNFTTransfers(
    walletAddress,
    chain ?? DEFAULT_CHAIN,
    cursor,
    limit
  );

  return result;
});

export const getNFTsByContract = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be logged in");

  const { contractAddress, chain, cursor, limit } = request.data as {
    contractAddress: string;
    chain?: MoralisChain;
    cursor?: string;
    limit?: number;
  };

  if (!contractAddress) throw new HttpsError("invalid-argument", "contractAddress is required");

  const result = await moralis.getNFTsByContract(
    contractAddress,
    chain ?? DEFAULT_CHAIN,
    cursor,
    limit
  );

  return result;
});
