import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthUser extends User {
  isAdmin?: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}