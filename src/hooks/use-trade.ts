import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeAdapter } from '@/adapters/trade-adapter';
import { useAuthStore } from '@/stores/auth-store';
import { useTradeStore } from '@/stores/trade-store';
import { useEffect } from 'react';

export const useIncomingOffers = () => {
  const user = useAuthStore((s) => s.user);
  const setIncoming = useTradeStore((s) => s.setIncomingOffers);

  const result = useQuery({
    queryKey: ["incomingOffers", user?.uid],
    queryFn: () => tradeAdapter.getIncomingOffers(user!.uid),
    enabled: !!user,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (result.data) setIncoming(result.data);
  }, [result.data, setIncoming]);

  return result;
};

export const useOutgoingOffers = () => {
  const user = useAuthStore((s) => s.user);
  const setOutgoing = useTradeStore((s) => s.setOutgoingOffers);

  const result = useQuery({
    queryKey: ["outgoingOffers", user?.uid],
    queryFn: () => tradeAdapter.getOutgoingOffers(user!.uid),
    enabled: !!user,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (result.data) setOutgoing(result.data);
  }, [result.data, setOutgoing]);

  return result;
};

export const useSubscribeIncoming = () => {
  const user = useAuthStore((s) => s.user);
  const setIncoming = useTradeStore((s) => s.setIncomingOffers);

  useEffect(() => {
    if (!user) {
      return;
    }

    return tradeAdapter.subscribeToIncomingOffers(user.uid, setIncoming);
  }, [user, setIncoming]);
};

export const useCreateTrade = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: tradeAdapter.createTradeOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingOffers", user?.uid] });
    },
  });
};

export const useAcceptTrade = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (tradeId: string) => tradeAdapter.acceptTrade(tradeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["incomingOffers", user?.uid] });
      await queryClient.invalidateQueries({ queryKey: ["inventory", user?.uid] });
      await queryClient.invalidateQueries({ queryKey: ["tradeHistory", user?.uid] });
    },
  });
};

export const useRejectTrade = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (tradeId: string) => tradeAdapter.rejectTrade(tradeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["incomingOffers", user?.uid] });
      await queryClient.invalidateQueries({ queryKey: ["tradeHistory", user?.uid] });
    },
  });
};

export const useCancelTrade = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (tradeId: string) => tradeAdapter.cancelTrade(tradeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outgoingOffers", user?.uid] });
      await queryClient.invalidateQueries({ queryKey: ["tradeHistory", user?.uid] });
    },
  });
};

