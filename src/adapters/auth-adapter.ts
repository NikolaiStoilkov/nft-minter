import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuthPort } from "@/domain/ports";
import type { UserProfile } from "@/domain/types";

const provider = new GoogleAuthProvider();

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
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn("Could not write user profile to Firestore:", e);
  }
  return profile;
};

const signInWithGoogle: AuthPort["signInWithGoogle"] = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return ensureUserProfile(result.user);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
      console.warn("Popup blocked/closed, trying redirect...");
      await signInWithRedirect(auth, provider);
      return null as unknown as UserProfile;
    }
    console.error("Sign-in error:", err.code, err.message);
    throw error;
  }
};

const signOut: AuthPort["signOut"] = async () => {
  await fbSignOut(auth);
};

const onAuthStateChanged: AuthPort["onAuthStateChanged"] = (callback) => {
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        const profile = await ensureUserProfile(result.user);
        callback(profile);
      }
    })
    .catch((e) => console.warn("Redirect result error:", e));

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
