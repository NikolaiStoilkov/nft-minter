import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import type { TradePort } from "@/domain/ports";
import type { TradeOffer } from "@/domain/types";

const tryCallable = async <T>(fnName: string, data: unknown): Promise<T | null> => {
  try {
    const fn = httpsCallable<unknown, T>(functions, fnName);
    const result = await fn(data);
    return result.data;
  } catch (e) {
    console.warn(`Cloud Function "${fnName}" failed, using Firestore fallback:`, e);
    return null;
  }
};

const createTradeOffer: TradePort["createTradeOffer"] = async (offer) => {
  const result = await tryCallable<{ tradeId: string }>("createTrade", offer);
  if (result) return result.tradeId;

  const docRef = await addDoc(collection(db, "trades"), {
    ...offer,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

const acceptTrade: TradePort["acceptTrade"] = async (tradeId) => {
  const result = await tryCallable("acceptTrade", { tradeId });
  if (result) return;

  const tradeRef = doc(db, "trades", tradeId);
  const tradeSnap = await getDoc(tradeRef);
  if (!tradeSnap.exists()) throw new Error("Trade not found");

  const trade = tradeSnap.data() as TradeOffer;
  const batch = writeBatch(db);

  for (const nftId of trade.offeredNftIds) {
    batch.update(doc(db, "nfts", nftId), { ownerId: trade.toUserId });
  }
  for (const nftId of trade.requestedNftIds) {
    batch.update(doc(db, "nfts", nftId), { ownerId: trade.fromUserId });
  }

  batch.update(tradeRef, { status: "accepted", updatedAt: serverTimestamp() });

  const historyRef = doc(collection(db, "tradeHistory"));
  batch.set(historyRef, {
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "accepted",
    participants: [trade.fromUserId, trade.toUserId],
    completedAt: serverTimestamp(),
  });

  await batch.commit();
};

const rejectTrade: TradePort["rejectTrade"] = async (tradeId) => {
  const result = await tryCallable("rejectTrade", { tradeId });
  if (result) return;

  const tradeRef = doc(db, "trades", tradeId);
  const tradeSnap = await getDoc(tradeRef);
  if (!tradeSnap.exists()) throw new Error("Trade not found");
  const trade = tradeSnap.data() as TradeOffer;

  await updateDoc(tradeRef, { status: "rejected", updatedAt: serverTimestamp() });

  await addDoc(collection(db, "tradeHistory"), {
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "rejected",
    participants: [trade.fromUserId, trade.toUserId],
    completedAt: serverTimestamp(),
  });
};

const cancelTrade: TradePort["cancelTrade"] = async (tradeId) => {
  const result = await tryCallable("cancelTrade", { tradeId });
  if (result) return;

  const tradeRef = doc(db, "trades", tradeId);
  const tradeSnap = await getDoc(tradeRef);
  if (!tradeSnap.exists()) throw new Error("Trade not found");
  const trade = tradeSnap.data() as TradeOffer;

  await updateDoc(tradeRef, { status: "cancelled", updatedAt: serverTimestamp() });

  await addDoc(collection(db, "tradeHistory"), {
    tradeId,
    fromUserId: trade.fromUserId,
    fromUserName: trade.fromUserName,
    toUserId: trade.toUserId,
    toUserName: trade.toUserName,
    offeredNftIds: trade.offeredNftIds,
    requestedNftIds: trade.requestedNftIds,
    status: "cancelled",
    participants: [trade.fromUserId, trade.toUserId],
    completedAt: serverTimestamp(),
  });
};

const getIncomingOffers: TradePort["getIncomingOffers"] = async (userId) => {
  const q = query(
    collection(db, "trades"),
    where("toUserId", "==", userId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TradeOffer);
};

const getOutgoingOffers: TradePort["getOutgoingOffers"] = async (userId) => {
  const q = query(
    collection(db, "trades"),
    where("fromUserId", "==", userId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TradeOffer);
};

const subscribeToIncomingOffers: TradePort["subscribeToIncomingOffers"] = (userId, callback) => {
  const q = query(
    collection(db, "trades"),
    where("toUserId", "==", userId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TradeOffer));
  });
};

export const tradeAdapter: TradePort = {
  createTradeOffer,
  acceptTrade,
  rejectTrade,
  cancelTrade,
  getIncomingOffers,
  getOutgoingOffers,
  subscribeToIncomingOffers,
};
