import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIncidents, useCreateIncident, useUpdateIncident } from "./useIncidents";
import type { ReactNode } from "react";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe("useIncidents", () => {
  it("fetches incidents successfully", async () => {
    const { result } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.[0]).toHaveProperty("title");
    expect(result.current.data?.[0]).toHaveProperty("status");
    expect(result.current.data?.[0]).toHaveProperty("severity");
  });

  it("returns incidents with correct structure", async () => {
    const { result } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const incident = result.current.data?.[0];
    expect(incident).toHaveProperty("id");
    expect(incident).toHaveProperty("title");
    expect(incident).toHaveProperty("description");
    expect(incident).toHaveProperty("status");
    expect(incident).toHaveProperty("severity");
    expect(incident).toHaveProperty("assigneeId");
    expect(incident).toHaveProperty("createdAt");
    expect(incident).toHaveProperty("updatedAt");
    expect(incident).toHaveProperty("statusHistory");
  });
});

describe("useCreateIncident", () => {
  it("creates a new incident", async () => {
    const { result } = renderHook(() => useCreateIncident(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Test incident",
      description: "Test description for the incident",
      severity: "High",
      assigneeId: null,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveProperty("id");
    expect(result.current.data?.title).toBe("Test incident");
    expect(result.current.data?.status).toBe("Open");
  });
});

describe("useUpdateIncident", () => {
  it("updates an incident", async () => {
    // First get an incident ID
    const { result: incidentsResult } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(incidentsResult.current.isSuccess).toBe(true);
    });

    const incidentId = incidentsResult.current.data?.[0].id;

    // Now update it
    const { result } = renderHook(() => useUpdateIncident(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: incidentId!,
      input: { status: "In Progress" },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.status).toBe("In Progress");
  });
});