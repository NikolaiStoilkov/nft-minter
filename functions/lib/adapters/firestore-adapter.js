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
exports.createHistoryRepo = exports.createNFTRepo = exports.createTradeRepo = void 0;
const admin = __importStar(require("firebase-admin"));
const getDb = () => admin.firestore();
const createTradeRepo = () => ({
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
        if (!snap.exists)
            return null;
        return { id: snap.id, ...snap.data() };
    },
    updateTradeStatus: async (tradeId, status) => {
        await getDb().collection("trades").doc(tradeId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    },
});
exports.createTradeRepo = createTradeRepo;
const createNFTRepo = () => ({
    verifyOwnership: async (nftIds, ownerId) => {
        if (nftIds.length === 0)
            return true;
        const snaps = await Promise.all(nftIds.map((id) => getDb().collection("nfts").doc(id).get()));
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
        if (!snap.exists)
            return null;
        return snap.data()?.walletAddress ?? null;
    },
    getNFTContractAddress: async (nftId) => {
        const snap = await getDb().collection("nfts").doc(nftId).get();
        if (!snap.exists)
            return null;
        return snap.data()?.contractAddress ?? null;
    },
    getNFTTokenId: async (nftId) => {
        const snap = await getDb().collection("nfts").doc(nftId).get();
        if (!snap.exists)
            return null;
        const data = snap.data();
        return data?.tokenId != null ? String(data.tokenId) : null;
    },
});
exports.createNFTRepo = createNFTRepo;
const createHistoryRepo = () => ({
    recordHistory: async (entry) => {
        await getDb().collection("tradeHistory").add({
            ...entry,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    },
});
exports.createHistoryRepo = createHistoryRepo;
//# sourceMappingURL=firestore-adapter.js.map