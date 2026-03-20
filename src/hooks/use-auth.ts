
import { useEffect, useCallback } from "react";
import { authAdapter } from "@/adapters/auth-adapter";
import { useAuthStore } from "@/stores/auth-store";

export const useAuthListener = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsub = authAdapter.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsub;
  }, [setUser, setLoading]);
};

export const useSignIn = () => {
  const signIn = useCallback(async () => {
    try {
      await authAdapter.signInWithGoogle();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("Sign in failed:", err.code, err.message);
      if (err.code === "auth/unauthorized-domain") {
        alert(
          "This domain is not authorized for sign-in. Please add it to your Firebase Console → Authentication → Settings → Authorized domains."
        );
      } else if (err.code === "auth/configuration-not-found") {
        alert(
          "Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Google."
        );
      } else {
        alert(`Sign in failed: ${err.message || "Unknown error"}`);
      }
    }
  }, []);
  return signIn;
};

export const useSignOut = () => {
  const signOut = useCallback(async () => {
    try {
      await authAdapter.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);
  return signOut;
};
