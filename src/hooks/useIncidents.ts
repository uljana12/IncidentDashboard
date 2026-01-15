/**
 * React Query hooks for incident CRUD operations.
 * Provides data fetching, caching, and mutation capabilities for incidents.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
} from "../api/types";

/** Query key for incident data caching */
const INCIDENTS_KEY = ["incidents"];

/**
 * Fetches all incidents from the API.
 * @returns Promise resolving to an array of incidents
 * @throws Error if the request fails
 */
async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetch("/api/incidents");
  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return response.json();
}

/**
 * Creates a new incident via the API.
 * @param input - The incident data to create
 * @returns Promise resolving to the created incident
 * @throws Error if the request fails or validation fails
 */
async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const response = await fetch("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create incident");
  }
  return response.json();
}

/**
 * Updates an existing incident via the API.
 * @param params - Object containing incident ID and update data
 * @returns Promise resolving to the updated incident
 * @throws Error if the request fails or incident not found
 */
async function updateIncident({
  id,
  input,
}: {
  id: string;
  input: UpdateIncidentInput;
}): Promise<Incident> {
  const response = await fetch(`/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update incident");
  }
  return response.json();
}

/**
 * Hook to fetch and cache all incidents.
 *
 * @returns React Query result object with incidents data, loading state, and error state
 */
export function useIncidents() {
  return useQuery({
    queryKey: INCIDENTS_KEY,
    queryFn: fetchIncidents,
  });
}

/**
 * Hook to create a new incident.
 * Automatically invalidates the incidents cache on success.
 *
 * @returns React Query mutation object with mutate function and mutation state
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_KEY });
    },
  });
}

/**
 * Hook to update an existing incident.
 * Implements optimistic updates for instant UI feedback.
 * Automatically rolls back on error and invalidates cache on completion.
 *
 * @returns React Query mutation object with mutate function and mutation state
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncident,
    // Optimistic update: immediately update the cache before the request completes
    onMutate: async ({ id, input }) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: INCIDENTS_KEY });

      // Snapshot the previous value for rollback
      const previousIncidents = queryClient.getQueryData<Incident[]>(INCIDENTS_KEY);

      // Optimistically update the cache
      if (previousIncidents) {
        queryClient.setQueryData<Incident[]>(INCIDENTS_KEY, (old) =>
          old?.map((incident) =>
            incident.id === id ? { ...incident, ...input } : incident
          )
        );
      }

      // Return context with the snapshot for rollback
      return { previousIncidents };
    },
    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousIncidents) {
        queryClient.setQueryData(INCIDENTS_KEY, context.previousIncidents);
      }
    },
    // Always refetch after error or success to ensure cache is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_KEY });
    },
  });
}