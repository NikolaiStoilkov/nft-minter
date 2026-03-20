
import { useQuery } from "@tanstack/react-query";
import { userAdapter } from "@/adapters/user-adapter";
import { useAuthStore } from "@/stores/auth-store";

export const useSearchUsers = (searchQuery: string) => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () => userAdapter.searchUsers(searchQuery, user!.uid),
    enabled: !!user && searchQuery.length >= 2,
  });
};

export const useAllUsers = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["allUsers", user?.uid],
    queryFn: () => userAdapter.getAllUsers(user!.uid),
    enabled: !!user,
  });
};

export const useUserProfile = (uid: string | undefined) => {
  return useQuery({
    queryKey: ["userProfile", uid],
    queryFn: () => userAdapter.getUserProfile(uid!),
    enabled: !!uid,
  });
};

