/**
 * Testing utilities and custom render function.
 * Provides a wrapper that includes all necessary providers for testing.
 */

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a QueryClient configured for testing.
 * - Disables retries for predictable test behavior
 * - Sets gcTime to 0 to prevent caching between tests
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Renders a component with all required providers for testing.
 * Includes QueryClientProvider with test-specific configuration.
 * 
 * @param ui - React element to render
 * @param options - Additional render options
 * @returns Render result plus queryClient for test assertions
 * 
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export everything from testing-library for convenience
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";