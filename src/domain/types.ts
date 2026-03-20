
export interface NFTItem {
  id: string;
  tokenId: number;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  imageEmoji: string;
  ownerId: string;
  mintedAt: number;
  transactionHash: string;
}

export interface TradeOffer {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  offeredNftIds: string[];
  requestedNftIds: string[];
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: number;
  updatedAt: number;
}

export interface TradeHistoryEntry {
  id: string;
  tradeId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  offeredNftIds: string[];
  requestedNftIds: string[];
  status: "accepted" | "rejected" | "cancelled";
  completedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: number;
}

export const RARITY_CONFIG: Record<NFTItem["rarity"], { color: string; chance: number; label: string }> = {
  common: { color: "text-gray-400", chance: 0.4, label: "Common" },
  uncommon: { color: "text-green-400", chance: 0.3, label: "Uncommon" },
  rare: { color: "text-blue-400", chance: 0.15, label: "Rare" },
  epic: { color: "text-purple-400", chance: 0.1, label: "Epic" },
  legendary: { color: "text-yellow-400", chance: 0.05, label: "Legendary" },
};

export const NFT_EMOJIS = ["💎", "🔮", "⚡", "🌟", "🎭", "🐉", "🦅", "🔥", "❄️", "🌊", "🗡️", "🛡️", "👑", "🏆", "🎪"];

export const NFT_NAMES = [
  "Crystal Shard", "Mystic Orb", "Thunder Bolt", "Star Fragment",
  "Shadow Mask", "Dragon Scale", "Eagle Eye", "Phoenix Flame",
  "Frost Heart", "Ocean Pearl", "Void Blade", "Titan Shield",
  "Royal Crown", "Golden Trophy", "Chaos Ring",
];

