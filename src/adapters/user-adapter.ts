
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserPort } from "@/domain/ports";
import type { UserProfile } from "@/domain/types";

const getUserProfile: UserPort["getUserProfile"] = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
};

const searchUsers: UserPort["searchUsers"] = async (queryStr, currentUserId) => {
  const q = query(
    collection(db, "users"),
    where("displayName", ">=", queryStr),
    where("displayName", "<=", queryStr + "\uf8ff"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
    .filter((u) => u.uid !== currentUserId);
};

const getAllUsers: UserPort["getAllUsers"] = async (currentUserId) => {
  const q = query(collection(db, "users"), limit(50));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
    .filter((u) => u.uid !== currentUserId);
};

export const userAdapter: UserPort = {
  getUserProfile,
  searchUsers,
  getAllUsers,
};

