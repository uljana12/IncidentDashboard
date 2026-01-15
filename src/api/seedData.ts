/**
 * Default seed data for incidents and users.
 * This data is used to initialize the application on first load
 * and when resetting the database via POST /api/reset.
 */

import type { Incident, User } from "./types";

/**
 * Default users available in the system.
 * Used for assignee selection in incident forms.
 */
export const defaultUsers: User[] = [
  { id: "user-1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "user-2", name: "Bob Smith", email: "bob@example.com" },
  { id: "user-3", name: "Carol Williams", email: "carol@example.com" },
  { id: "user-4", name: "David Brown", email: "david@example.com" },
];

/**
 * Default incidents seeded on first load.
 * Provides a variety of statuses, severities, and states for demonstration.
 */
export const defaultIncidents: Incident[] = [
  {
    id: "inc-1",
    title: "Database connection timeout",
    description:
      "The main database is experiencing intermittent connection timeouts affecting user authentication.",
    status: "Open",
    severity: "High",
    assigneeId: "user-1",
    createdAt: "2026-01-08T10:30:00Z",
    updatedAt: "2026-01-08T10:30:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-08T10:30:00Z",
        changedBy: "user-2",
      },
    ],
  },
  {
    id: "inc-2",
    title: "Payment gateway error",
    description:
      "Users are receiving 500 errors when attempting to complete checkout.",
    status: "In Progress",
    severity: "Critical",
    assigneeId: "user-2",
    createdAt: "2026-01-07T14:00:00Z",
    updatedAt: "2026-01-08T09:15:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-07T14:00:00Z",
        changedBy: "user-3",
      },
      {
        status: "In Progress",
        changedAt: "2026-01-08T09:15:00Z",
        changedBy: "user-2",
      },
    ],
  },
  {
    id: "inc-3",
    title: "Email notifications delayed",
    description:
      "Transactional emails are being delayed by up to 30 minutes.",
    status: "Resolved",
    severity: "Medium",
    assigneeId: "user-3",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-06T16:45:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-05T08:00:00Z",
        changedBy: "user-1",
      },
      {
        status: "In Progress",
        changedAt: "2026-01-05T10:30:00Z",
        changedBy: "user-3",
      },
      {
        status: "Resolved",
        changedAt: "2026-01-06T16:45:00Z",
        changedBy: "user-3",
      },
    ],
  },
  {
    id: "inc-4",
    title: "Dashboard loading slowly",
    description:
      "The main dashboard takes over 10 seconds to load for some users.",
    status: "Open",
    severity: "Low",
    assigneeId: null,
    createdAt: "2026-01-09T11:00:00Z",
    updatedAt: "2026-01-09T11:00:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-09T11:00:00Z",
        changedBy: "user-4",
      },
    ],
  },
  {
    id: "inc-5",
    title: "Mobile app crash on login",
    description:
      "iOS users report the app crashes when attempting to log in with biometrics.",
    status: "In Progress",
    severity: "High",
    assigneeId: "user-4",
    createdAt: "2026-01-08T15:30:00Z",
    updatedAt: "2026-01-09T09:00:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-08T15:30:00Z",
        changedBy: "user-1",
      },
      {
        status: "In Progress",
        changedAt: "2026-01-09T09:00:00Z",
        changedBy: "user-4",
      },
    ],
  },
];
