/**
 * Centralizes dropdown options and sort order definitions.
 */

import type { IncidentSeverity, IncidentStatus } from "../api/types";

/**
 * Severity options for dropdown menus.
 */
export const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

/**
 * Status options for dropdown menus.
 */
export const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

/**
 * Severity options with a placeholder for the create form.
 */
export const SEVERITY_OPTIONS_WITH_PLACEHOLDER = [
  { value: "", label: "Select severity..." },
  ...SEVERITY_OPTIONS,
];

/**
 * Numeric order for severity levels (higher = more severe).
 * Used for sorting incidents by severity.
 */
export const SEVERITY_ORDER: Record<IncidentSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Numeric order for status values (workflow progression).
 * Used for sorting incidents by status.
 */
export const STATUS_ORDER: Record<IncidentStatus, number> = {
  Open: 1,
  "In Progress": 2,
  Resolved: 3,
};