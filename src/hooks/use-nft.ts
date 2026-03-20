
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nftAdapter } from "@/adapters/nft-adapter";
import { useAuthStore } from "@/stores/auth-store";
import { useNFTStore } from "@/stores/nft-store";
import { useEffect } from "react";

export const useInventory = () => {
  const user = useAuthStore((s) => s.user);
  const setInventory = useNFTStore((s) => s.setInventory);

  const result = useQuery({
    queryKey: ["inventory", user?.uid],
    queryFn: () => nftAdapter.getUserNFTs(user!.uid),
    enabled: !!user,
  });

  useEffect(() => {
    if (result.data) setInventory(result.data);
  }, [result.data, setInventory]);

  return result;
};

export const useSubscribeInventory = () => {
  const user = useAuthStore((s) => s.user);
  const setInventory = useNFTStore((s) => s.setInventory);

  useEffect(() => {
    if (!user) return;
    const unsub = nftAdapter.subscribeToUserNFTs(user.uid, setInventory);
    return unsub;
  }, [user, setInventory]);
};

export const useMintNFT = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addToInventory = useNFTStore((s) => s.addToInventory);

  return useMutation({
    mutationFn: () => nftAdapter.mintNFT(user!.uid),
    onSuccess: (nft) => {
      addToInventory(nft);
      queryClient.invalidateQueries({ queryKey: ["inventory", user?.uid] });
    },
  });
};

export const useUserNFTs = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userNfts", userId],
    queryFn: () => nftAdapter.getUserNFTs(userId!),
    enabled: !!userId,
  });
};

