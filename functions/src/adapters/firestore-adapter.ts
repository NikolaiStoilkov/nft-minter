import * as admin from "firebase-admin";
import { TradeRepository, NFTRepository, HistoryRepository } from "../domain/ports";
import { TradeOffer, TradeHistoryEntry } from "../domain/types";

const getDb = () => admin.firestore();

export const createTradeRepo = (): TradeRepository => ({
  createTrade: async (trade) => {
    const doc = await getDb().collection("trades").add({
      ...trade,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return doc.id;
  },

  getTrade: async (tradeId) => {
    const snap = await getDb().collection("trades").doc(tradeId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as TradeOffer;
  },

  updateTradeStatus: async (tradeId, status) => {
    await getDb().collection("trades").doc(tradeId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  },
});

export const createNFTRepo = (): NFTRepository => ({
  verifyOwnership: async (nftIds, ownerId) => {
    if (nftIds.length === 0) return true;
    const snaps = await Promise.all(
      nftIds.map((id) => getDb().collection("nfts").doc(id).get())
    );
    return snaps.every((s) => s.exists && s.data()?.ownerId === ownerId);
  },

  transferNFTs: async (nftIds, _fromUserId, toUserId) => {
    const batch = getDb().batch();
    for (const id of nftIds) {
      batch.update(getDb().collection("nfts").doc(id), { ownerId: toUserId });
    }
    await batch.commit();
  },

  getWalletAddress: async (userId) => {
    const snap = await getDb().collection("users").doc(userId).get();
    if (!snap.exists) return null;
    return (snap.data()?.walletAddress as string | undefined) ?? null;
  },

  getNFTContractAddress: async (nftId) => {
    const snap = await getDb().collection("nfts").doc(nftId).get();
    if (!snap.exists) return null;
    return (snap.data()?.contractAddress as string | undefined) ?? null;
  },

  getNFTTokenId: async (nftId) => {
    const snap = await getDb().collection("nfts").doc(nftId).get();
    if (!snap.exists) return null;
    const data = snap.data();
    return data?.tokenId != null ? String(data.tokenId) : null;
  },
});

export const createHistoryRepo = (): HistoryRepository => ({
  recordHistory: async (entry) => {
    await getDb().collection("tradeHistory").add({
      ...entry,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  },
});
