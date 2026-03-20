
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

      if (err.code === "auth/popup-blocked") {
        alert(
          "Popup was blocked by your browser. Please allow popups for this site and try again."
        );
      } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User closed the popup — no need to alert
      } else if (err.code === "auth/unauthorized-domain") {
        alert(
          "This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains."
        );
      } else if (err.code === "auth/configuration-not-found") {
        alert(
          "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google."
        );
      } else if (err.code === "auth/network-request-failed") {
        alert("Network error. Check your internet connection and try again.");
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
