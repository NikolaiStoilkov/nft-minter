import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuthPort } from "@/domain/ports";
import type { UserProfile } from "@/domain/types";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const mapFirebaseUser = (user: User): UserProfile => ({
  uid: user.uid,
  email: user.email || "",
  displayName: user.displayName || "Anonymous",
  photoURL: user.photoURL || "",
  createdAt: Date.now(),
});

const ensureUserProfile = async (user: User): Promise<UserProfile> => {
  const profile = mapFirebaseUser(user);
  const userRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, { ...profile, createdAt: serverTimestamp() });
    }
  } catch (e) {
    console.warn("Could not write user profile to Firestore:", e);
  }
  return profile;
};

const signInWithGoogle: AuthPort["signInWithGoogle"] = async () => {
  const result = await signInWithPopup(auth, provider);
  return ensureUserProfile(result.user);
};

const signOut: AuthPort["signOut"] = async () => {
  await fbSignOut(auth);
};

const onAuthStateChanged: AuthPort["onAuthStateChanged"] = (callback) => {
  return fbOnAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await ensureUserProfile(user);
      callback(profile);
    } else {
      callback(null);
    }
  });
};

const getCurrentUser: AuthPort["getCurrentUser"] = () => {
  const user = auth.currentUser;
  if (!user) return null;
  return mapFirebaseUser(user);
};

export const authAdapter: AuthPort = {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
};
