import { create } from "zustand";
import type { TradeOffer } from "@/domain/types";

interface TradeState {
  incomingOffers: TradeOffer[];
  outgoingOffers: TradeOffer[];
  isCreatingTrade: boolean;
  tradeModalOpen: boolean;
  selectedTradeUserId: string | null;
  setIncomingOffers: (offers: TradeOffer[]) => void;
  setOutgoingOffers: (offers: TradeOffer[]) => void;
  setCreatingTrade: (creating: boolean) => void;
  openTradeModal: (userId: string) => void;
  closeTradeModal: () => void;
}

export const useTradeStore = create<TradeState>()((set) => ({
  incomingOffers: [],
  outgoingOffers: [],
  isCreatingTrade: false,
  tradeModalOpen: false,
  selectedTradeUserId: null,
  setIncomingOffers: (incomingOffers) => set({ incomingOffers }),
  setOutgoingOffers: (outgoingOffers) => set({ outgoingOffers }),
  setCreatingTrade: (isCreatingTrade) => set({ isCreatingTrade }),
  openTradeModal: (userId) => set({ tradeModalOpen: true, selectedTradeUserId: userId }),
  closeTradeModal: () => set({ tradeModalOpen: false, selectedTradeUserId: null }),
}));

