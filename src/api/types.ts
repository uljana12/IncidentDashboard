/**
 * Type definitions for the Incident Dashboard API.
 * These types are shared between the mock API and the React application.
 */

/**
 * Possible status values for an incident.
 * Follows a workflow progression: Open → In Progress → Resolved
 */
export type IncidentStatus = "Open" | "In Progress" | "Resolved";

/**
 * Severity levels for incidents, ordered from lowest to highest impact.
 */
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";

/**
 * Represents a user who can be assigned to incidents.
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Represents a single entry in an incident's status history.
 * Created automatically when an incident's status changes.
 */
export interface StatusHistoryEntry {
  /** The status that was set */
  status: IncidentStatus;
  /** Timestamp of when the change occurred */
  changedAt: string;
  /** User ID of who made the change */
  changedBy: string;
}

/**
 * Represents a single incident in the system.
 */
export interface Incident {
  /** Unique identifier for the incident */
  id: string;
  /** Brief title describing the incident */
  title: string;
  /** Detailed description of the incident */
  description: string;
  /** Current status of the incident */
  status: IncidentStatus;
  /** Severity level of the incident */
  severity: IncidentSeverity;
  /** ID of the assigned user, or null if unassigned */
  assigneeId: string | null;
  /** Timestamp of when the incident was created */
  createdAt: string;
  /** Timestamp of the last update */
  updatedAt: string;
  /** Chronological history of status changes */
  statusHistory: StatusHistoryEntry[];
}

/**
 * Input data required to create a new incident.
 * Status defaults to "Open" and timestamps are set automatically.
 */
export interface CreateIncidentInput {
  title: string;
  description: string;
  severity: IncidentSeverity;
  assigneeId: string | null;
}

/**
 * Input data for updating an existing incident.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  assigneeId?: string | null;
}
