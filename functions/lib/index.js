"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNFTsByContract = exports.getWalletNFTTransfers = exports.getNFTMetadata = exports.getWalletNFTs = exports.cancelTrade = exports.rejectTrade = exports.acceptTrade = exports.createTrade = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const firestore_adapter_1 = require("./adapters/firestore-adapter");
const moralis_adapter_1 = require("./adapters/moralis-adapter");
admin.initializeApp();
const tradeRepo = (0, firestore_adapter_1.createTradeRepo)();
const nftRepo = (0, firestore_adapter_1.createNFTRepo)();
const historyRepo = (0, firestore_adapter_1.createHistoryRepo)();
const moralis = (0, moralis_adapter_1.createMoralisAdapter)();
const DEFAULT_CHAIN = process.env.NFT_CHAIN ?? "sepolia";
const verifyOnChainIfPossible = async (nftIds, userId) => {
    if (nftIds.length === 0)
        return;
    const walletAddress = await nftRepo.getWalletAddress(userId);
    if (!walletAddress)
        return;
    const nftSnaps = await Promise.all(nftIds.map(async (id) => ({
        id,
        contractAddress: await nftRepo.getNFTContractAddress(id),
        tokenId: await nftRepo.getNFTTokenId(id),
    })));
    const byContract = new Map();
    for (const { contractAddress, tokenId } of nftSnaps) {
        if (!contractAddress || !tokenId)
            continue;
        const existing = byContract.get(contractAddress) ?? [];
        existing.push(tokenId);
        byContract.set(contractAddress, existing);
    }
    for (const [contractAddress, tokenIds] of byContract.entries()) {
        const owns = await moralis.verifyOnChainOwnership(walletAddress, contractAddress, tokenIds, DEFAULT_CHAIN);
        if (!owns) {
            throw new https_1.HttpsError("failed-precondition", `On-chain verification failed: wallet ${walletAddress} does not own all NFTs for contract ${contractAddress}`);
        }
    }
};
exports.createTrade = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { fromUserId, fromUserName, toUserId, toUserName, offeredNftIds, requestedNftIds } = request.data;
    if (uid !== fromUserId) {
        throw new https_1.HttpsError("permission-denied", "Cannot create trade on behalf of another user");
    }
    if ((!offeredNftIds || offeredNftIds.length === 0) && (!requestedNftIds || requestedNftIds.length === 0)) {
        throw new https_1.HttpsError("invalid-argument", "Trade must include at least one NFT");
    }
    if (fromUserId === toUserId) {
        throw new https_1.HttpsError("invalid-argument", "Cannot trade with yourself");
    }
    if (offeredNftIds && offeredNftIds.length > 0) {
        const ownsAll = await nftRepo.verifyOwnership(offeredNftIds, fromUserId);
        if (!ownsAll) {
            throw new https_1.HttpsError("failed-precondition", "You don't own all offered NFTs");
        }
        await verifyOnChainIfPossible(offeredNftIds, fromUserId);
    }
    if (requestedNftIds && requestedNftIds.length > 0) {
        const ownsAll = await nftRepo.verifyOwnership(requestedNftIds, toUserId);
        if (!ownsAll) {
            throw new https_1.HttpsError("failed-precondition", "Target user doesn't own all requested NFTs");
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
exports.acceptTrade = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { tradeId } = request.data;
    if (!tradeId)
        throw new https_1.HttpsError("invalid-argument", "tradeId is required");
    const trade = await tradeRepo.getTrade(tradeId);
    if (!trade)
        throw new https_1.HttpsError("not-found", "Trade not found");
    if (trade.status !== "pending")
        throw new https_1.HttpsError("failed-precondition", "Trade is no longer pending");
    if (trade.toUserId !== uid)
        throw new https_1.HttpsError("permission-denied", "Only the recipient can accept");
    if (trade.offeredNftIds.length > 0) {
        const fromOwns = await nftRepo.verifyOwnership(trade.offeredNftIds, trade.fromUserId);
        if (!fromOwns)
            throw new https_1.HttpsError("failed-precondition", "Sender no longer owns offered NFTs");
        await verifyOnChainIfPossible(trade.offeredNftIds, trade.fromUserId);
    }
    if (trade.requestedNftIds.length > 0) {
        const toOwns = await nftRepo.verifyOwnership(trade.requestedNftIds, trade.toUserId);
        if (!toOwns)
            throw new https_1.HttpsError("failed-precondition", "You no longer own the requested NFTs");
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
exports.rejectTrade = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { tradeId } = request.data;
    if (!tradeId)
        throw new https_1.HttpsError("invalid-argument", "tradeId is required");
    const trade = await tradeRepo.getTrade(tradeId);
    if (!trade)
        throw new https_1.HttpsError("not-found", "Trade not found");
    if (trade.status !== "pending")
        throw new https_1.HttpsError("failed-precondition", "Trade is no longer pending");
    if (trade.toUserId !== uid)
        throw new https_1.HttpsError("permission-denied", "Only the recipient can reject");
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
exports.cancelTrade = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { tradeId } = request.data;
    if (!tradeId)
        throw new https_1.HttpsError("invalid-argument", "tradeId is required");
    const trade = await tradeRepo.getTrade(tradeId);
    if (!trade)
        throw new https_1.HttpsError("not-found", "Trade not found");
    if (trade.status !== "pending")
        throw new https_1.HttpsError("failed-precondition", "Trade is no longer pending");
    if (trade.fromUserId !== uid)
        throw new https_1.HttpsError("permission-denied", "Only the sender can cancel");
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
exports.getWalletNFTs = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { walletAddress, chain, contractAddress, cursor, limit } = request.data;
    if (!walletAddress)
        throw new https_1.HttpsError("invalid-argument", "walletAddress is required");
    const result = await moralis.getWalletNFTs(walletAddress, chain ?? DEFAULT_CHAIN, contractAddress, cursor, limit);
    return result;
});
exports.getNFTMetadata = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { contractAddress, tokenId, chain } = request.data;
    if (!contractAddress)
        throw new https_1.HttpsError("invalid-argument", "contractAddress is required");
    if (!tokenId)
        throw new https_1.HttpsError("invalid-argument", "tokenId is required");
    const result = await moralis.getNFTMetadata(contractAddress, tokenId, chain ?? DEFAULT_CHAIN);
    if (!result)
        throw new https_1.HttpsError("not-found", "NFT metadata not found");
    return result;
});
exports.getWalletNFTTransfers = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { walletAddress, chain, cursor, limit } = request.data;
    if (!walletAddress)
        throw new https_1.HttpsError("invalid-argument", "walletAddress is required");
    const result = await moralis.getNFTTransfers(walletAddress, chain ?? DEFAULT_CHAIN, cursor, limit);
    return result;
});
exports.getNFTsByContract = (0, https_1.onCall)(async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Must be logged in");
    const { contractAddress, chain, cursor, limit } = request.data;
    if (!contractAddress)
        throw new https_1.HttpsError("invalid-argument", "contractAddress is required");
    const result = await moralis.getNFTsByContract(contractAddress, chain ?? DEFAULT_CHAIN, cursor, limit);
    return result;
});
//# sourceMappingURL=index.js.map