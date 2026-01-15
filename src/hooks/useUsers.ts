/**
 * React Query hook for fetching users.
 * Users are cached longer than incidents since they change less frequently.
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "../api/types";

/**
 * Fetches all users from the API.
 * @returns Promise resolving to an array of users
 * @throws Error if the request fails
 */
async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

/**
 * Hook to fetch and cache all users.
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes - users don't change often
  });
}