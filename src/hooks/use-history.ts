
import { useQuery } from "@tanstack/react-query";
import { historyAdapter } from "@/adapters/history-adapter";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { useState } from "react";
import type { TradeHistoryEntry } from "@/domain/types";

export const useTradeHistory = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["tradeHistory", user?.uid],
    queryFn: () => historyAdapter.getTradeHistory(user!.uid),
    enabled: !!user,
  });
};

export const useSubscribeHistory = () => {
  const user = useAuthStore((s) => s.user);
  const [history, setHistory] = useState<TradeHistoryEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = historyAdapter.subscribeToHistory(user.uid, setHistory);
    return unsub;
  }, [user]);

  return history;
};

