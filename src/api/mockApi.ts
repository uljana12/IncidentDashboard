/**
 * Mock API implementation that intercepts fetch requests.
 * 
 * Provides a RESTful API simulation with:
 * - CRUD operations for incidents
 * - User listing
 * - Simulated network delay (disabled in tests)
 * - Data persistence via storage module
 */

import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
} from "./types";
import { getIncidents, setIncidents, getUsers, resetData } from "./storage";

/** 
 * Simulated network delay in milliseconds.
 * Set to 0 in test environment for faster tests.
 */
const SIMULATED_DELAY =
  typeof process !== "undefined" && process.env?.NODE_ENV === "test" ? 0 : 300;

/**
 * Creates a promise that resolves after the specified delay.
 * @param ms - Milliseconds to delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a unique incident ID.
 * Format: inc-{timestamp}-{random}
 * @returns Unique incident ID string
 */
function generateId(): string {
  return `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a JSON Response object.
 * @param data - Data to serialize as JSON body
 * @param status - HTTP status code (default: 200)
 * @returns Response object with JSON content-type
 */
function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates an error Response object.
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns Response object with error JSON
 */
function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Function signature for route handlers */
type RouteHandler = (
  params: Record<string, string>,
  request: Request,
) => Promise<Response>;

/** Route definition with HTTP method, URL pattern, and handler */
interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

/**
 * Route definitions for the mock API.
 * Each route matches a method + URL pattern and calls the appropriate handler.
 */
const routes: Route[] = [
  // GET /api/incidents - List all incidents
  {
    method: "GET",
    pattern: /^\/api\/incidents$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      return jsonResponse(getIncidents());
    },
  },

  // GET /api/incidents/:id - Get incident by ID
  {
    method: "GET",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const incident = incidents.find((inc) => inc.id === params.id);
      if (!incident) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }
      return jsonResponse(incident);
    },
  },

  // POST /api/incidents - Create new incident
  {
    method: "POST",
    pattern: /^\/api\/incidents$/,
    handler: async (_params, request) => {
      await delay(SIMULATED_DELAY);
      const input: CreateIncidentInput = await request.json();

      // Validation
      if (!input.title?.trim()) {
        return errorResponse("Title is required", 400);
      }
      if (!input.severity) {
        return errorResponse("Severity is required", 400);
      }

      const now = new Date().toISOString();
      const newIncident: Incident = {
        id: generateId(),
        title: input.title.trim(),
        description: input.description || "",
        status: "Open",
        severity: input.severity,
        assigneeId: input.assigneeId || null,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: "Open",
            changedAt: now,
            changedBy: "current-user",
          },
        ],
      };

      const incidents = getIncidents();
      incidents.unshift(newIncident);
      setIncidents(incidents);

      return jsonResponse(newIncident, 201);
    },
  },

  // PATCH /api/incidents/:id - Update incident
  {
    method: "PATCH",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params, request) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const index = incidents.findIndex((inc) => inc.id === params.id);

      if (index === -1) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }

      const input: UpdateIncidentInput = await request.json();
      const existing = incidents[index];
      const now = new Date().toISOString();

      // Track status change in history
      let statusHistory = existing.statusHistory;
      if (input.status && input.status !== existing.status) {
        statusHistory = [
          ...statusHistory,
          {
            status: input.status,
            changedAt: now,
            changedBy: "current-user",
          },
        ];
      }

      const updated: Incident = {
        ...existing,
        ...input,
        updatedAt: now,
        statusHistory,
      };

      incidents[index] = updated;
      setIncidents(incidents);

      return jsonResponse(updated);
    },
  },

  // DELETE /api/incidents/:id - Delete incident
  {
    method: "DELETE",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const index = incidents.findIndex((inc) => inc.id === params.id);

      if (index === -1) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }

      incidents.splice(index, 1);
      setIncidents(incidents);

      return new Response(null, { status: 204 });
    },
  },

  // GET /api/users - List all users
  {
    method: "GET",
    pattern: /^\/api\/users$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      return jsonResponse(getUsers());
    },
  },

  // POST /api/reset - Reset data to defaults (for testing)
  {
    method: "POST",
    pattern: /^\/api\/reset$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      resetData();
      return jsonResponse({ message: "Data reset to defaults" });
    },
  },
];

/**
 * Matches a request against defined routes.
 * @param method - HTTP method
 * @param pathname - URL pathname
 * @returns Matched route and extracted params, or null if no match
 */
function matchRoute(
  method: string,
  pathname: string
): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;

    const match = pathname.match(route.pattern);
    if (match) {
      // Extract named params from regex groups
      const params: Record<string, string> = {};
      if (match[1]) {
        params.id = match[1];
      }
      return { route, params };
    }
  }
  return null;
}

/** Store for the original fetch function */
let originalFetch: typeof fetch | null = null;

/**
 * Initializes the mock API by intercepting global fetch.
 * Requests to /api/* are handled by the mock, others pass through.
 */
export function initMockApi(): void {
  if (originalFetch) {
    // Already initialized
    return;
  }

  originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Get the URL string from input
    let urlString: string;
    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.href;
    } else {
      // input is Request
      urlString = input.url;
    }

    // Parse URL with base to handle relative URLs
    const url = new URL(urlString, "http://localhost");

    // Only intercept /api/* requests
    if (!url.pathname.startsWith("/api/")) {
      return originalFetch!(input, init);
    }

    // Create request for handler (with full URL to avoid jsdom issues)
    const request = new Request(url.href, init);

    const matched = matchRoute(request.method, url.pathname);
    if (matched) {
      return matched.route.handler(matched.params, request);
    }

    return errorResponse("Not found", 404);
  };
}

/**
 * Removes the mock API and restores original fetch.
 * Useful for cleanup in tests.
 */
export function teardownMockApi(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = null;
  }
}
