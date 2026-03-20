
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NFTPort } from "@/domain/ports";
import type { NFTItem } from "@/domain/types";
import { NFT_EMOJIS, NFT_NAMES, RARITY_CONFIG } from "@/domain/types";

const generateRarity = (): NFTItem["rarity"] => {
  const roll = Math.random();
  let cumulative = 0;
  for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
    cumulative += config.chance;
    if (roll <= cumulative) return rarity as NFTItem["rarity"];
  }
  return "common";
};

const generateFakeTxHash = (): string => {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
};

const mintNFT: NFTPort["mintNFT"] = async (userId) => {
  const tokenId = Math.floor(Math.random() * 10000) + 1;
  const nameIdx = Math.floor(Math.random() * NFT_NAMES.length);
  const emojiIdx = Math.floor(Math.random() * NFT_EMOJIS.length);
  const rarity = generateRarity();

  const nftData = {
    tokenId,
    name: NFT_NAMES[nameIdx],
    rarity,
    imageEmoji: NFT_EMOJIS[emojiIdx],
    ownerId: userId,
    mintedAt: Date.now(),
    transactionHash: generateFakeTxHash(),
  };

  const docRef = await addDoc(collection(db, "nfts"), {
    ...nftData,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...nftData };
};

const getUserNFTs: NFTPort["getUserNFTs"] = async (userId) => {
  const q = query(
    collection(db, "nfts"),
    where("ownerId", "==", userId),
    orderBy("mintedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NFTItem);
};

const getNFTById: NFTPort["getNFTById"] = async (nftId) => {
  const snap = await getDoc(doc(db, "nfts", nftId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as NFTItem;
};

const subscribeToUserNFTs: NFTPort["subscribeToUserNFTs"] = (userId, callback) => {
  const q = query(
    collection(db, "nfts"),
    where("ownerId", "==", userId),
    orderBy("mintedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NFTItem));
  });
};

export const nftAdapter: NFTPort = {
  mintNFT,
  getUserNFTs,
  getNFTById,
  subscribeToUserNFTs,
};

