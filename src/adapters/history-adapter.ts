
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HistoryPort } from "@/domain/ports";
import type { TradeHistoryEntry } from "@/domain/types";

const getTradeHistory: HistoryPort["getTradeHistory"] = async (userId) => {
  const q = query(
    collection(db, "tradeHistory"),
    where("participants", "array-contains", userId),
    orderBy("completedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TradeHistoryEntry);
};

const subscribeToHistory: HistoryPort["subscribeToHistory"] = (userId, callback) => {
  const q = query(
    collection(db, "tradeHistory"),
    where("participants", "array-contains", userId),
    orderBy("completedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TradeHistoryEntry));
  });
};

export const historyAdapter: HistoryPort = {
  getTradeHistory,
  subscribeToHistory,
};

